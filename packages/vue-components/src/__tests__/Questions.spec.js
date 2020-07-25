import { mount } from '@vue/test-utils';
import Question from '../questions/Question.vue';
import QOption from '../questions/QOption.vue';

/*
 Key states to always test for each question type:
 - unanswered (STATE_FRESH + !answered)
 - answered correctly (STATE_CORRECT + answered)
 - checked wrongly (STATE_WRONG + !answered)
 - answered wrongly (STATE_WRONG + answered)

 Header, hints, reasons are trivially included in different combinations throughout
 */

// this file concerns only testing questions without quizzes, but vue test utils
// complains (softly) of unprovided injections
const DEFAULT_INJECTIONS = {
  questions: undefined,
  gotoNextQuestion: undefined,
};

const DEFAULT_STUBS = {
  'q-option': QOption,
  'box': true,
};

describe('Mcq Questions and QOptions', () => {
  test('of unanswered with shown hint and header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'mcq' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, not selected</q-option>',
          '<q-option>opt 2 - incorrect, not selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, selected</q-option>',
          '<q-option correct>opt 4 - correct, not selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        header: 'unanswered mcq question header',
        hint: 'mcq question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // Click hint
    await wrapper.find('button.btn-success').trigger('click');
    // Click 'check' without having clicked any options
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered correctly with unshown hint without header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'mcq' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, not selected</q-option>',
          '<q-option>opt 2 - incorrect, not selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, selected</q-option>',
          '<q-option correct>opt 4 - correct, not selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        hint: 'unshown mcq question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click option 2
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    // then click option 3 - option 2 should be deactivated
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    // then click option 2 - option 3 should stay activated since question is answered
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of checked wrongly with shown hint without header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'mcq' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, not selected</q-option>',
          '<q-option>opt 2 - incorrect, selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, not selected</q-option>',
          '<q-option correct>opt 4 - correct, not selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        hint: 'mcq question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click option 2
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');
    // click 'hint'
    await wrapper.find('button.btn-success').trigger('click');
    // click 'retry' -- no change
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered wrongly with header without hint renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'mcq' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, not selected</q-option>',
          '<q-option>opt 2 - incorrect, selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, not selected</q-option>',
          '<q-option correct>opt 4 - correct, not selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        header: 'mcq question header',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click option 2
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');
    // click 'show'
    await wrapper.find('button.btn-info').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});

describe('Checkbox Questions and QOptions', () => {
  test('of unanswered with header without hint renders correctly ', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'checkbox' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, selected</q-option>',
          '<q-option>opt 2 - incorrect, not selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, selected</q-option>',
          '<q-option correct>opt 4 - correct, not selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        header: 'Checkbox question header',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // Click options 1 & 3
    await wrapper.findAllComponents(QOption).at(0).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered correctly with unshown hint without header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'checkbox' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, not selected</q-option>',
          '<q-option>opt 2 - incorrect, not selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, selected</q-option>',
          '<q-option correct>opt 4 - correct, selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        hint: 'checkbox question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click options 3 & 4
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(3).find('div').trigger('click');

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    // click option 3, which should stay activated as question has been answered
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of checked wrongly with shown hint without header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'checkbox' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, selected</q-option>',
          '<q-option>opt 2 - incorrect, selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, selected</q-option>',
          '<q-option correct>opt 4 - correct, selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        hint: 'checkbox question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click 'hint'
    await wrapper.find('button.btn-success').trigger('click');

    // click options 1 & 2 & 3 & 4
    await wrapper.findAllComponents(QOption).at(0).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(3).find('div').trigger('click');

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered wrongly with header without hint renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'checkbox' },
      slots: {
        default: [
          'Question content',
          '<q-option>opt 1 - incorrect, selected</q-option>',
          '<q-option>opt 2 - incorrect, selected, with reason'
            + '<template #reason>opt 2 reason</template></q-option>',
          '<q-option correct>opt 3 - correct, selected</q-option>',
          '<q-option correct>opt 4 - correct, not selected, with reason'
            + '<template #reason>opt 4 reason</template></q-option>',
        ],
        header: 'Checkbox question header',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click options 1 & 2 & 3
    await wrapper.findAllComponents(QOption).at(0).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    // click 'show'
    await wrapper.find('button.btn-info').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});

describe('Text Questions', () => {
  test('of unanswered with shown hint, header without answer renders correctly ', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'text' },
      slots: {
        default: 'Question content',
        header: 'Text question header',
        hint: 'text question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click 'hint'
    await wrapper.find('button.btn-success').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered correctly with answer, unshown hint without header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: {
        type: 'text',
        keywords: 'abc,123',
      },
      slots: {
        default: 'Question content',
        hint: 'text question hint',
        answer: 'text question answer',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // type answer into textarea
    await wrapper.find('textarea').setValue('lorem abc ipsum 123');

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered correctly with answer without header, hint, keywords renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: { type: 'text' },
      slots: {
        default: 'Question content',
        answer: 'text question answer',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // type answer into textarea
    await wrapper.find('textarea').setValue('this should be correct no matter what is typed');

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of checked wrongly with answer shown hint without header renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: {
        type: 'text',
        keywords: 'abc,123',
      },
      slots: {
        default: 'Question content',
        hint: 'text question hint',
        answer: 'text question answer',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click 'hint'
    await wrapper.find('button.btn-success').trigger('click');

    // type answer into textarea
    await wrapper.find('textarea').setValue('abc lorem ipsum');
    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    // retype answer into textarea
    await wrapper.find('textarea').setValue('123 lorem ipsum');
    // click 'retry'
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered wrongly with answer, header without hint renders correctly', async () => {
    const wrapper = mount(Question, {
      propsData: {
        type: 'text',
        keywords: 'abc,123',
      },
      slots: {
        default: 'Question content',
        header: 'Text question header',
        answer: 'text question answer',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // type answer into textarea
    await wrapper.find('textarea').setValue('abc lorem ipsum');
    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');
    // click 'show'
    await wrapper.find('button.btn-info').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});

// TODO deprecate this
describe('Typeless Questions', () => {
  test('of answered with answer, header, shown hint renders correctly', async () => {
    const wrapper = mount(Question, {
      slots: {
        default: 'Question content',
        header: 'Typeless question header',
        answer: 'Typeless question answer',
        hint: 'Typeless question hint',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');
    // click 'hint'
    await wrapper.find('button.btn-success').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('of answered with answer, header without hint renders correctly', async () => {
    const wrapper = mount(Question, {
      slots: {
        default: 'Question content',
        header: 'Typeless question header',
        answer: 'Typeless question answer',
      },
      provide: DEFAULT_INJECTIONS,
      stubs: DEFAULT_STUBS,
    });

    // click 'check'
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});
