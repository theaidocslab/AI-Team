import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { DemoExplainer, demoExplainerTotalDuration } from "./DemoExplainer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="DemoExplainer"
        component={DemoExplainer}
        durationInFrames={demoExplainerTotalDuration}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
