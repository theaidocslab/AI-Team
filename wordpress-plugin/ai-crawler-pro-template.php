<?php
/**
 * Plugin Name: AI Crawler Pro™
 * Plugin URI: https://theaidocslab.com
 * Description: Sovereign Entity JSON-LD + Bing IndexNow + Google Sitemap engine. Standalone — does not modify any existing SEO plugin. Part of The Sovereign Stack™ by The AI Docs Lab™.
 * Version: 1.0.0
 * Author: Dr. Eric Townsend, PhD — The AI Docs Lab™
 * License: Proprietary — Single Site License
 * Text Domain: ai-crawler-pro
 * Built-By: The AI Docs Lab™ | theaidocslab.com | AEO & GEO Pro™ Engine
 *
 * TEMPLATE VERSION — reusable starting point for new WordPress clients.
 * All client-specific fields below are intentionally left blank. Fill in
 * aicrawler_licensed_domain before activating on a client's live site, or
 * the plugin runs unlocked (any domain) until a domain is set.
 */

if (!defined('ABSPATH')) exit;

// ============================================================
// CONSTANTS
// ============================================================
define('AICRAWLER_VERSION',    '1.0.0');
define('AICRAWLER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AICRAWLER_PLUGIN_URL', plugin_dir_url(__FILE__));

function aicrawler_domain_check() {
    $licensed = get_option('aicrawler_licensed_domain', '');
    if (empty($licensed)) return true;
    $current  = strtolower(preg_replace('/^www\./i', '', parse_url(home_url(), PHP_URL_HOST)));
    $licensed = strtolower(preg_replace('/^www\./i', '', $licensed));
    return ($current === $licensed);
}

// ============================================================
// ACTIVATION — blank defaults, filled in per-client from the admin dashboard
// ============================================================
register_activation_hook(__FILE__, function() {
    $defaults = [
        // Core entity
        'aicrawler_schema_name'       => '',
        'aicrawler_schema_type'       => 'LocalBusiness',
        'aicrawler_owner_name'        => '',
        'aicrawler_website_url'       => home_url(),
        'aicrawler_phone'             => '',
        'aicrawler_phone_tollfree'    => '',
        'aicrawler_email'             => '',
        'aicrawler_address'           => '',
        'aicrawler_city'              => '',
        'aicrawler_state'             => '',
        'aicrawler_zip'               => '',
        'aicrawler_country'           => 'US',
        'aicrawler_founded'           => '',
        'aicrawler_image'             => '',

        // AEO/GEO content — written for AI crawlers, fill in per client
        'aicrawler_description'       => '',
        'aicrawler_area'              => '',
        'aicrawler_services'          => '',

        // sameAs — entity authority links
        'aicrawler_linkedin'          => '',
        'aicrawler_facebook'          => '',
        'aicrawler_yelp'              => '',
        'aicrawler_bbb'               => '',
        'aicrawler_gbp'               => '',
        'aicrawler_instagram'         => '',
        'aicrawler_twitter'           => '',

        // Domain lock — set to the client's real domain before go-live
        'aicrawler_licensed_domain'   => '',

        // Crawler notification
        'aicrawler_indexnow_key'      => '',
        'aicrawler_indexnow_log'      => '',
    ];
    foreach ($defaults as $key => $val) {
        add_option($key, $val);
    }

    // Generate a unique IndexNow key on first activation only
    if (empty(get_option('aicrawler_indexnow_key'))) {
        update_option('aicrawler_indexnow_key', wp_generate_password(32, false, false));
    }

    flush_rewrite_rules();
});

// ============================================================
// INDEXNOW — write the verification key file to site root
// ============================================================
add_action('init', function() {
    $key = get_option('aicrawler_indexnow_key', '');
    if (empty($key)) return;

    $key_file = ABSPATH . $key . '.txt';
    if (!file_exists($key_file)) {
        @file_put_contents($key_file, $key);
    }
});

// ============================================================
// INDEXNOW — ping Bing whenever a post or page is published/updated
// ============================================================
function aicrawler_indexnow_ping($url) {
    $key  = get_option('aicrawler_indexnow_key', '');
    $host = parse_url(home_url(), PHP_URL_HOST);
    if (empty($key) || empty($url)) return false;

    $body = json_encode([
        'host'        => $host,
        'key'         => $key,
        'keyLocation' => home_url('/' . $key . '.txt'),
        'urlList'     => [$url],
    ]);

    $response = wp_remote_post('https://api.indexnow.org/indexnow', [
        'headers' => ['Content-Type' => 'application/json; charset=utf-8'],
        'body'    => $body,
        'timeout' => 8,
    ]);

    $code = is_wp_error($response) ? 'error: ' . $response->get_error_message() : wp_remote_retrieve_response_code($response);
    $log  = get_option('aicrawler_indexnow_log', '');
    $entry = date('Y-m-d H:i:s') . ' — ' . $url . ' — ' . $code . "\n";
    update_option('aicrawler_indexnow_log', $entry . $log); // newest first

    return $code;
}

add_action('publish_post', function($ID, $post) { aicrawler_indexnow_ping(get_permalink($post)); }, 10, 2);
add_action('publish_page', function($ID, $post) { aicrawler_indexnow_ping(get_permalink($post)); }, 10, 2);

// Manual ping trigger from the dashboard button
add_action('admin_init', function() {
    if (!isset($_POST['aicrawler_manual_ping']) || !current_user_can('manage_options')) return;
    check_admin_referer('aicrawler_manual_ping_action');
    aicrawler_indexnow_ping(home_url());
});

// ============================================================
// GOOGLE — generate and serve a basic XML sitemap, submit via Search Console manually
// ============================================================
add_action('init', function() {
    add_rewrite_rule('^ai-crawler-sitemap\.xml$', 'index.php?aicrawler_sitemap=1', 'top');
    add_filter('query_vars', function($vars) { $vars[] = 'aicrawler_sitemap'; return $vars; });
});

add_action('template_redirect', function() {
    if (get_query_var('aicrawler_sitemap') != 1) return;
    if (!aicrawler_domain_check()) return;

    header('Content-Type: application/xml; charset=UTF-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<!-- Generated by AI Crawler Pro™ | Built by The AI Docs Lab™ | theaidocslab.com -->' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

    echo '<url><loc>' . esc_url(home_url('/')) . '</loc><priority>1.0</priority></url>' . "\n";

    $pages = get_pages(['post_status' => 'publish']);
    foreach ($pages as $p) {
        echo '<url><loc>' . esc_url(get_permalink($p->ID)) . '</loc><lastmod>' . esc_html(get_the_modified_date('Y-m-d', $p->ID)) . '</lastmod></url>' . "\n";
    }

    $posts = get_posts(['post_status' => 'publish', 'numberposts' => 500]);
    foreach ($posts as $p) {
        echo '<url><loc>' . esc_url(get_permalink($p->ID)) . '</loc><lastmod>' . esc_html(get_the_modified_date('Y-m-d', $p->ID)) . '</lastmod></url>' . "\n";
    }

    echo '</urlset>';
    exit;
});

// ============================================================
// ADMIN MENU
// ============================================================
add_action('admin_menu', function() {
    add_menu_page(
        'AI Crawler Pro™',
        '🚂 AI Crawler Pro™',
        'manage_options',
        'ai-crawler-pro',
        'aicrawler_render_page',
        'dashicons-admin-site-alt3',
        32
    );
});

// ============================================================
// ADMIN STYLES
// ============================================================
add_action('admin_head', function() {
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'ai-crawler') === false) return;
    echo '<style>
    .acp-wrap{max-width:900px;margin:24px auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
    .acp-header{background:#0A1A2F;border-bottom:3px solid #C9501E;padding:20px 28px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:space-between;}
    .acp-header h1{color:#E8893A;font-size:20px;margin:0;font-weight:700;}
    .acp-header span{color:#9AABC0;font-size:12px;}
    .acp-badge{background:#C9501E;color:#fff;font-size:10px;font-weight:800;padding:3px 10px;border-radius:12px;letter-spacing:1px;text-transform:uppercase;}
    .acp-badge-v{background:#1D9E75;color:#fff;font-size:10px;font-weight:800;padding:3px 10px;border-radius:12px;letter-spacing:1px;text-transform:uppercase;}
    .acp-body{background:#fff;border:1px solid #ddd;border-top:none;padding:28px;border-radius:0 0 8px 8px;}
    .acp-section{margin-bottom:32px;padding-bottom:32px;border-bottom:1px solid #f0f0f0;}
    .acp-section:last-child{border-bottom:none;margin-bottom:0;}
    .acp-section-title{font-size:13px;font-weight:700;color:#0A1A2F;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #C9501E;display:inline-block;}
    .acp-section-title.entity{border-bottom-color:#1D9E75;}
    .acp-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .acp-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
    .acp-field label{font-size:12px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:0.5px;}
    .acp-field input,.acp-field select,.acp-field textarea{border:1.5px solid #ddd;border-radius:4px;padding:9px 12px;font-size:13px;width:100%;}
    .acp-field input:focus,.acp-field select:focus,.acp-field textarea:focus{outline:none;border-color:#C9501E;}
    .acp-field textarea{min-height:80px;resize:vertical;}
    .acp-score-wrap{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;}
    .acp-score-card{flex:1;min-width:120px;background:#0A1A2F;border-radius:8px;padding:16px;text-align:center;border-top:3px solid #C9501E;}
    .acp-score-num{font-size:32px;font-weight:800;color:#E8893A;line-height:1;}
    .acp-score-label{font-size:11px;color:#9AABC0;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;}
    .acp-check{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:4px;margin-bottom:6px;font-size:13px;}
    .acp-check.pass{background:#f0fdf4;color:#166534;}
    .acp-check.warn{background:#fffbeb;color:#92400e;}
    .acp-btn{background:#C9501E;color:#fff;border:none;padding:11px 28px;font-size:13px;font-weight:700;border-radius:4px;cursor:pointer;text-transform:uppercase;letter-spacing:0.5px;}
    .acp-btn:hover{background:#A8410E;}
    .acp-domain-locked{background:#f0fdf4;border:1.5px solid #16a34a;border-radius:6px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#166534;}
    .acp-domain-unlocked{background:#fffbeb;border:1.5px solid #d97706;border-radius:6px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#92400e;}
    .acp-entity-banner{background:#f0fdf4;border:1.5px solid #1D9E75;border-radius:6px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#166534;}
    .acp-sovereign{background:#0A1A2F;border-radius:6px;padding:14px 18px;margin-top:24px;text-align:center;}
    .acp-sovereign p{color:#E8893A;font-size:11px;margin:0;letter-spacing:1px;text-transform:uppercase;}
    .acp-preview-box{background:#f8f8f8;border:1px solid #ddd;border-radius:4px;padding:14px;margin-top:12px;font-family:monospace;font-size:11px;color:#444;line-height:1.7;white-space:pre-wrap;word-break:break-all;}
    </style>';
});

// ============================================================
// SETTINGS PAGE
// ============================================================
function aicrawler_render_page() {
    if (!current_user_can('manage_options')) return;

    if (isset($_POST['aicrawler_save'])) {
        check_admin_referer('aicrawler_save_action');

        $text_fields = [
            'aicrawler_schema_name','aicrawler_schema_type','aicrawler_owner_name',
            'aicrawler_website_url','aicrawler_phone','aicrawler_phone_tollfree',
            'aicrawler_email','aicrawler_address','aicrawler_city','aicrawler_state',
            'aicrawler_zip','aicrawler_country','aicrawler_founded','aicrawler_image',
            'aicrawler_area','aicrawler_linkedin','aicrawler_facebook','aicrawler_yelp',
            'aicrawler_bbb','aicrawler_gbp','aicrawler_instagram','aicrawler_twitter',
            'aicrawler_licensed_domain',
        ];
        foreach ($text_fields as $field) {
            update_option($field, sanitize_text_field($_POST[$field] ?? ''));
        }
        update_option('aicrawler_description', sanitize_textarea_field($_POST['aicrawler_description'] ?? ''));
        update_option('aicrawler_services',    sanitize_textarea_field($_POST['aicrawler_services'] ?? ''));

        echo '<div class="notice notice-success"><p>✅ AI Crawler Pro™ settings saved.</p></div>';
    }

    // Health score
    $score = 0; $checks = [];
    $name        = get_option('aicrawler_schema_name');
    $desc        = get_option('aicrawler_description');
    $gbp         = get_option('aicrawler_gbp');
    $li          = get_option('aicrawler_linkedin');
    $fb          = get_option('aicrawler_facebook');
    $yelp        = get_option('aicrawler_yelp');
    $domain      = get_option('aicrawler_licensed_domain');

    if ($name)  { $score += 20; $checks[] = ['pass','✓','Business entity name set']; } else { $checks[] = ['warn','⚠','Business entity name not set']; }
    if ($desc)  { $score += 25; $checks[] = ['pass','✓','AEO entity description set']; } else { $checks[] = ['warn','⚠','AEO entity description not set']; }
    if ($fb)    { $score += 15; $checks[] = ['pass','✓','Facebook linked (sameAs)']; } else { $checks[] = ['warn','⚠','Facebook not linked']; }
    if ($yelp)  { $score += 15; $checks[] = ['pass','✓','Yelp linked (sameAs)']; } else { $checks[] = ['warn','⚠','Yelp not linked']; }
    if ($gbp)   { $score += 15; $checks[] = ['pass','✓','Google Business Profile linked']; } else { $checks[] = ['warn','⚠','Google Business Profile not linked yet']; }
    if ($li)    { $score += 10; $checks[] = ['pass','✓','LinkedIn linked']; } else { $checks[] = ['warn','⚠','LinkedIn not linked']; }

    $domain_locked = !empty($domain);
    $domain_match  = aicrawler_domain_check();
    $preview       = aicrawler_build_schema(true);
    ?>
    <div class="acp-wrap">
        <div class="acp-header">
            <h1>🚂 AI Crawler Pro™</h1>
            <div style="display:flex;align-items:center;gap:12px;">
                <span>v<?php echo AICRAWLER_VERSION; ?></span>
                <span class="acp-badge">Sovereign Stack™</span>
                <span class="acp-badge-v">Standalone Engine</span>
            </div>
        </div>
        <div class="acp-body">

            <?php if ($domain_locked && $domain_match): ?>
            <div class="acp-domain-locked">🔒 Licensed to: <strong><?php echo esc_html($domain); ?></strong> — Active &amp; Verified</div>
            <?php elseif (!$domain_locked): ?>
            <div class="acp-domain-unlocked">⚠ No domain lock set yet — set the licensed domain below before go-live.</div>
            <?php endif; ?>

            <div class="acp-section">
                <div class="acp-score-wrap">
                    <div class="acp-score-card">
                        <div class="acp-score-num"><?php echo $score; ?></div>
                        <div class="acp-score-label">Entity Score</div>
                    </div>
                    <div class="acp-score-card">
                        <div class="acp-score-num"><?php echo count(array_filter($checks, fn($c) => $c[0]==='pass')); ?>/<?php echo count($checks); ?></div>
                        <div class="acp-score-label">Checks Passed</div>
                    </div>
                </div>
                <?php foreach ($checks as $check): ?>
                <div class="acp-check <?php echo $check[0]; ?>">
                    <span><?php echo $check[1]; ?></span>
                    <span><?php echo $check[2]; ?></span>
                </div>
                <?php endforeach; ?>
            </div>

            <form method="post">
                <?php wp_nonce_field('aicrawler_save_action'); ?>

                <div class="acp-section">
                    <div class="acp-section-title entity">🤖 Entity Definition — AI Engine Injection</div>
                    <div class="acp-grid">
                        <div class="acp-field">
                            <label>Business Name</label>
                            <input type="text" name="aicrawler_schema_name" value="<?php echo esc_attr(get_option('aicrawler_schema_name')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Business Type</label>
                            <select name="aicrawler_schema_type">
                                <?php $type = get_option('aicrawler_schema_type', 'LocalBusiness'); ?>
                                <option value="LocalBusiness" <?php selected($type, 'LocalBusiness'); ?>>Local Business</option>
                                <option value="ProfessionalService" <?php selected($type, 'ProfessionalService'); ?>>Professional Service</option>
                                <option value="StorageFacility" <?php selected($type, 'StorageFacility'); ?>>Storage Facility</option>
                            </select>
                        </div>
                        <div class="acp-field">
                            <label>Owner / Founder</label>
                            <input type="text" name="aicrawler_owner_name" value="<?php echo esc_attr(get_option('aicrawler_owner_name')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Year Founded</label>
                            <input type="text" name="aicrawler_founded" value="<?php echo esc_attr(get_option('aicrawler_founded')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Phone</label>
                            <input type="text" name="aicrawler_phone" value="<?php echo esc_attr(get_option('aicrawler_phone')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Toll-Free Phone</label>
                            <input type="text" name="aicrawler_phone_tollfree" value="<?php echo esc_attr(get_option('aicrawler_phone_tollfree')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Email</label>
                            <input type="email" name="aicrawler_email" value="<?php echo esc_attr(get_option('aicrawler_email')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Website URL</label>
                            <input type="url" name="aicrawler_website_url" value="<?php echo esc_attr(get_option('aicrawler_website_url')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Street Address</label>
                            <input type="text" name="aicrawler_address" value="<?php echo esc_attr(get_option('aicrawler_address')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>City</label>
                            <input type="text" name="aicrawler_city" value="<?php echo esc_attr(get_option('aicrawler_city')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>State</label>
                            <input type="text" name="aicrawler_state" value="<?php echo esc_attr(get_option('aicrawler_state')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>ZIP</label>
                            <input type="text" name="aicrawler_zip" value="<?php echo esc_attr(get_option('aicrawler_zip')); ?>">
                        </div>
                    </div>

                    <div class="acp-field">
                        <label>Entity Description (written for AI crawlers)</label>
                        <textarea name="aicrawler_description" placeholder="A clear, factual paragraph describing what this business does, who it serves, and what makes it credible — this is what AI assistants read back to people who ask about it."><?php echo esc_textarea(get_option('aicrawler_description')); ?></textarea>
                    </div>
                    <div class="acp-field">
                        <label>Service Area</label>
                        <input type="text" name="aicrawler_area" value="<?php echo esc_attr(get_option('aicrawler_area')); ?>">
                    </div>
                    <div class="acp-field">
                        <label>Services (comma separated)</label>
                        <textarea name="aicrawler_services"><?php echo esc_textarea(get_option('aicrawler_services')); ?></textarea>
                    </div>

                    <div class="acp-section-title entity" style="margin-top:8px;">sameAs Profiles — Entity Authority Links</div>
                    <div class="acp-grid">
                        <div class="acp-field">
                            <label>Google Business Profile URL</label>
                            <input type="url" name="aicrawler_gbp" value="<?php echo esc_attr(get_option('aicrawler_gbp')); ?>" placeholder="Add once the client's GBP is verified">
                        </div>
                        <div class="acp-field">
                            <label>LinkedIn URL</label>
                            <input type="url" name="aicrawler_linkedin" value="<?php echo esc_attr(get_option('aicrawler_linkedin')); ?>" placeholder="Add when available">
                        </div>
                        <div class="acp-field">
                            <label>Facebook URL</label>
                            <input type="url" name="aicrawler_facebook" value="<?php echo esc_attr(get_option('aicrawler_facebook')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>Yelp URL</label>
                            <input type="url" name="aicrawler_yelp" value="<?php echo esc_attr(get_option('aicrawler_yelp')); ?>">
                        </div>
                        <div class="acp-field">
                            <label>BBB URL</label>
                            <input type="url" name="aicrawler_bbb" value="<?php echo esc_attr(get_option('aicrawler_bbb')); ?>" placeholder="Add when available">
                        </div>
                        <div class="acp-field">
                            <label>Instagram URL</label>
                            <input type="url" name="aicrawler_instagram" value="<?php echo esc_attr(get_option('aicrawler_instagram')); ?>" placeholder="Add when available">
                        </div>
                        <div class="acp-field">
                            <label>Twitter / X Handle</label>
                            <input type="text" name="aicrawler_twitter" value="<?php echo esc_attr(get_option('aicrawler_twitter')); ?>">
                        </div>
                    </div>

                    <?php if ($preview): ?>
                    <div style="margin-top:16px;">
                        <div style="font-size:12px;font-weight:700;color:#1D9E75;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Live Entity JSON-LD Preview</div>
                        <div class="acp-preview-box"><?php echo esc_html($preview); ?></div>
                    </div>
                    <?php endif; ?>
                </div>

                <div class="acp-section">
                    <div class="acp-section-title">🔒 Domain License Lock</div>
                    <div class="acp-field">
                        <label>Licensed Domain</label>
                        <input type="text" name="aicrawler_licensed_domain" value="<?php echo esc_attr(get_option('aicrawler_licensed_domain')); ?>" placeholder="e.g. clientdomain.com">
                    </div>
                </div>

                <div class="acp-section">
                    <div class="acp-section-title entity">🔔 Crawler Notification — Bing &amp; Google</div>
                    <div class="acp-entity-banner">
                        ⚡ Every published post or page pings Bing instantly via IndexNow. Google has no instant-ping API — a sitemap is auto-generated for Search Console submission instead.
                    </div>
                    <div class="acp-grid">
                        <div class="acp-field">
                            <label>IndexNow key (auto-generated)</label>
                            <input type="text" value="<?php echo esc_attr(get_option('aicrawler_indexnow_key')); ?>" readonly style="background:#f8f8f8;">
                        </div>
                        <div class="acp-field">
                            <label>Sitemap URL for Google Search Console</label>
                            <input type="text" value="<?php echo esc_url(home_url('/ai-crawler-sitemap.xml')); ?>" readonly style="background:#f8f8f8;">
                        </div>
                    </div>
                    <p style="font-size:12px;color:#666;margin:4px 0 0;">
                        Submit the sitemap URL above once in <a href="https://search.google.com/search-console" target="_blank">Google Search Console</a> → Sitemaps.
                    </p>
                </div>

                <button type="submit" name="aicrawler_save" class="acp-btn">💾 Save All Settings</button>

            </form>

            <form method="post" style="margin-top:20px;">
                <?php wp_nonce_field('aicrawler_manual_ping_action'); ?>
                <button type="submit" name="aicrawler_manual_ping" class="acp-btn" style="background:#0A1A2F;">📡 Ping Bing now (IndexNow)</button>
                <?php
                $log = get_option('aicrawler_indexnow_log', '');
                if ($log):
                    $lines = array_slice(array_filter(explode("\n", $log)), 0, 5);
                ?>
                <div class="acp-preview-box" style="margin-top:12px;"><?php echo esc_html(implode("\n", $lines)); ?></div>
                <?php endif; ?>
            </form>

            <div class="acp-sovereign">
                <p>⚡ AI Crawler Pro™ — The Sovereign Stack™ | Built by The AI Docs Lab™ | theaidocslab.com</p>
            </div>

        </div>
    </div>
    <?php
}

// ============================================================
// HELPER — Build Entity JSON-LD
// ============================================================
function aicrawler_build_schema($preview = false) {
    $name = get_option('aicrawler_schema_name');
    if (!$name) return $preview ? '' : null;

    $type     = get_option('aicrawler_schema_type', 'LocalBusiness');
    $owner    = get_option('aicrawler_owner_name');
    $phone    = get_option('aicrawler_phone');
    $email    = get_option('aicrawler_email');
    $address  = get_option('aicrawler_address');
    $city     = get_option('aicrawler_city');
    $state    = get_option('aicrawler_state');
    $zip      = get_option('aicrawler_zip');
    $country  = get_option('aicrawler_country', 'US');
    $url      = get_option('aicrawler_website_url') ?: home_url();
    $image    = get_option('aicrawler_image');
    $desc     = get_option('aicrawler_description');
    $founded  = get_option('aicrawler_founded');
    $area     = get_option('aicrawler_area');
    $services_raw = get_option('aicrawler_services');

    $gbp   = get_option('aicrawler_gbp');
    $li    = get_option('aicrawler_linkedin');
    $fb    = get_option('aicrawler_facebook');
    $yelp  = get_option('aicrawler_yelp');
    $bbb   = get_option('aicrawler_bbb');
    $ig    = get_option('aicrawler_instagram');
    $tw    = get_option('aicrawler_twitter');

    $same_as = array_values(array_filter([
        $gbp, $li, $fb, $yelp, $bbb, $ig,
        $tw ? 'https://twitter.com/' . ltrim($tw, '@') : '',
    ]));

    $schema = [
        '@context'  => 'https://schema.org',
        '@type'     => $type,
        'name'      => $name,
        'url'       => $url,
        'generator' => 'AI Crawler Pro™ by The AI Docs Lab™ — theaidocslab.com',
    ];

    if ($desc)    $schema['description']  = $desc;
    if ($phone)   $schema['telephone']    = $phone;
    if ($email)   $schema['email']        = $email;
    if ($image)   $schema['image']        = $image;
    if ($founded) $schema['foundingDate'] = $founded;
    if ($area)    $schema['areaServed']   = $area;
    if ($owner)   $schema['founder']      = ['@type' => 'Person', 'name' => $owner];

    if ($services_raw) {
        $services = array_values(array_filter(array_map('trim', explode(',', $services_raw))));
        if (!empty($services)) {
            $schema['hasOfferCatalog'] = [
                '@type' => 'OfferCatalog',
                'name'  => 'Services',
                'itemListElement' => array_map(fn($s) => [
                    '@type'       => 'Offer',
                    'itemOffered' => ['@type' => 'Service', 'name' => $s]
                ], $services)
            ];
        }
    }

    if ($address || $city) {
        $schema['address'] = array_filter([
            '@type'           => 'PostalAddress',
            'streetAddress'   => $address,
            'addressLocality' => $city,
            'addressRegion'   => $state,
            'postalCode'      => $zip,
            'addressCountry'  => $country,
        ]);
    }

    if (!empty($same_as)) $schema['sameAs'] = $same_as;

    if ($preview) {
        return json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    return $schema;
}

// ============================================================
// ENTITY JSON-LD — fires sitewide, separate from any existing SEO plugin's output
// ============================================================
add_action('wp_head', function() {
    if (!aicrawler_domain_check()) return;

    $schema = aicrawler_build_schema(false);
    if (!$schema) return;

    echo "\n<!-- Entity structured data generated by AI Crawler Pro™ | Built by The AI Docs Lab™ | theaidocslab.com -->\n";
    echo '<script type="application/ld+json">' . "\n";
    echo json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    echo "\n" . '</script>' . "\n";
    echo "<!-- /Entity JSON-LD | Built by The AI Docs Lab™ -->\n\n";
}, 100); // priority 100 — fires after any existing SEO plugin's own output, avoids collision
