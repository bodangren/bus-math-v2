export interface AuthoredCapstoneMilestone {
  title: string;
  focus: string;
  evidence: readonly string[];
}

export interface AuthoredCapstoneBlueprint {
  workbookTemplate: string;
  planningGuide: string;
  pitchRubric: string;
  modelTourChecklist: string;
  audience: string;
  finalPresentationExpectation: string;
  reflectionPrompt: string;
  milestones: readonly [AuthoredCapstoneMilestone, AuthoredCapstoneMilestone];
}

export const AUTHORED_CAPSTONE_BLUEPRINT: AuthoredCapstoneBlueprint = {
  workbookTemplate: 'capstone_investor_ready_workbook.xlsx',
  planningGuide: 'capstone_business_plan_guide.pdf',
  pitchRubric: 'capstone_pitch_rubric.pdf',
  modelTourChecklist: 'capstone_model_tour_checklist.pdf',
  audience: 'local entrepreneurs, teacher-panel reviewers, and mock investor judges',
  finalPresentationExpectation:
    'Deliver a final presentation and pitch that walks the audience through the workbook, the business plan, and the most important assumptions.',
  reflectionPrompt:
    'Name the strongest evidence in the plan, one assumption that still carries risk, and the revision you would make before a live investor meeting.',
  milestones: [
    {
      title: 'Milestone 1',
      focus: 'Lock the investor-ready workbook structure and choose the clearest evidence from Units 1-8.',
      evidence: [
        'A linked investor-ready workbook with statement, operations, and financing tabs.',
        'A curated evidence list showing which prior unit artifacts were reused or revised.',
        'A one-paragraph thesis explaining why the plan is fundable and sustainable.',
      ],
    },
    {
      title: 'Milestone 2',
      focus: 'Rehearse and deliver the final presentation with a coherent narrative, model tour, and audience-ready defense.',
      evidence: [
        'A polished business plan with an executive summary and recommendation.',
        'A timed model tour that references the workbook without losing the story.',
        'A final presentation and pitch that anticipates audience questions and answers them with evidence.',
      ],
    },
  ],
};
