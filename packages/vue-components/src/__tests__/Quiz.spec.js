import { mount } from '@vue/test-utils';
import Quiz from '../questions/Quiz.vue';
import Question from '../questions/Question.vue';
import QOption from '../questions/QOption.vue';

/*
 Key states:
 - Beginning screen
 - Question screen(s)
 - Score screen
 */

const DEFAULT_STUBS = {
  'question': Question,
  'q-option': QOption,
  'box': true,
};

const MCQ_QUESTION = `
<question type="mcq">
  ... Mcq question ...
  <q-option correct>opt 1 correct</q-option>
  <q-option>opt 2</q-option>
  <q-option>opt 3</q-option>
</question>
`;

const CHECKBOX_QUESTION = `
<question type="checkbox">
  ... Checkbox question ...
  <q-option correct>opt 1 correct</q-option>
  <q-option>opt 2</q-option>
  <q-option correct>opt 3 correct</q-option>
</question>
`;

const TEXT_QUESTION = `
<question type="text" keywords="abc">
  ... Text question ...
  <template #answer>text question answer</template>
  <template #hint>text question hint</template>
</question>
`;

describe('Quizzes', () => {
  test('intro screen with intro text renders correctly', () => {
    const wrapper = mount(Quiz, {
      slots: {
        default: '',
        intro: '<h1>Intro</h1>',
      },
      stubs: DEFAULT_STUBS,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('with mcq question marked correct shows next button after answering', async () => {
    const wrapper = mount(Quiz, {
      slots: {
        default: MCQ_QUESTION,
      },
      stubs: DEFAULT_STUBS,
    });

    // Click 'begin'
    await wrapper.find('button').trigger('click');

    // Click option 1 of mcq question
    await wrapper.findAllComponents(QOption).at(0).find('div').trigger('click');
    // Click check of mcq question
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('with checkbox question marked incorrect shows next button after answering', async () => {
    const wrapper = mount(Quiz, {
      slots: {
        default: CHECKBOX_QUESTION,
      },
      stubs: DEFAULT_STUBS,
    });

    // Click 'begin'
    await wrapper.find('button').trigger('click');

    // Click options 1 & 2 of checkbox question
    await wrapper.findAllComponents(QOption).at(0).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    // Click check of checkbox question
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('with text question marked correct shows next button after answering', async () => {
    const wrapper = mount(Quiz, {
      slots: {
        default: TEXT_QUESTION,
      },
      stubs: DEFAULT_STUBS,
    });

    // Click 'begin'
    await wrapper.find('button').trigger('click');

    // Type answer into textarea of text question
    await wrapper.find('textarea').setValue('abc lorem ipsum');
    // Click 'check' of text question
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('with all questions marks 2/3 correct shows ending screen', async () => {
    const wrapper = mount(Quiz, {
      slots: {
        default: [MCQ_QUESTION, TEXT_QUESTION, CHECKBOX_QUESTION],
      },
      stubs: DEFAULT_STUBS,
    });

    // Click 'begin'
    await wrapper.find('button').trigger('click');

    // Click option 2 of mcq question
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    // Click check of mcq question
    await wrapper.findComponent(Question).find('button.btn-primary').trigger('click');
    // Click next
    await wrapper.find('button.btn-primary').trigger('click');

    // Type answer into textarea of text question
    await wrapper.find('textarea').setValue('abc lorem ipsum');
    // Click 'check' of text question
    await wrapper.find('button.btn-primary').trigger('click');
    // Click next
    await wrapper.find('button.btn-primary').trigger('click');

    // Click options 1 & 3 of checkbox question
    await wrapper.findAllComponents(QOption).at(0).find('div').trigger('click');
    await wrapper.findAllComponents(QOption).at(2).find('div').trigger('click');
    // Click check of checkbox question
    await wrapper.find('button.btn-primary').trigger('click');
    // Click next
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('with 2 questions retry goes back to first', async () => {
    const wrapper = mount(Quiz, {
      slots: {
        default: [MCQ_QUESTION, TEXT_QUESTION],
      },
      stubs: DEFAULT_STUBS,
    });

    // Click 'begin'
    await wrapper.find('button').trigger('click');

    // Click option 2 of mcq question
    await wrapper.findAllComponents(QOption).at(1).find('div').trigger('click');
    // Click check of mcq question
    await wrapper.findComponent(Question).find('button.btn-primary').trigger('click');
    // Click next
    await wrapper.find('button.btn-primary').trigger('click');

    // Type answer into textarea of text question
    await wrapper.find('textarea').setValue('abc lorem ipsum');
    // Click 'check' of text question
    await wrapper.find('button.btn-primary').trigger('click');
    // Click next
    await wrapper.find('button.btn-primary').trigger('click');

    // Click retry
    await wrapper.find('button.btn-outline-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});
