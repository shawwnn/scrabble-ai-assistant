import ProcessingStepItem from "@/components/analyzer/ProcessingStepItem";
import { getStageStatus, PROCESSING_STAGES } from "@/lib/analyzer-processing";

interface ProcessingStepperProps {
  activeIndex: number;
}

export default function ProcessingStepper({ activeIndex }: ProcessingStepperProps) {
  return (
    <ol>
      {PROCESSING_STAGES.map((stage, index) => (
        <ProcessingStepItem
          key={stage.label}
          stage={stage}
          index={index}
          status={getStageStatus(index, activeIndex)}
          isLast={index === PROCESSING_STAGES.length - 1}
        />
      ))}
    </ol>
  );
}
