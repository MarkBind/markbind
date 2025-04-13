import { mount } from '@vue/test-utils';
import CardStack from '../cardstack/CardStack.vue';
import Card from '../cardstack/Card.vue';

const DEFAULT_STUBS = {
  card: Card,
};

const DEFAULT_GLOBAL_MOUNT_OPTIONS = {
  stubs: DEFAULT_STUBS,
};

const CARDS_CUSTOMISATION = `
  <card header="Normal Body" tag="Normal" keywords="Body" disabled>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor 
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
      exercitation ullamco laboris nisi ut aliquip ex ea commodo
  </card>
  <card header="Short Body" tag="Short" keywords="Body">
      Lorem ipsum dolor sit amet, consectetur adipisicing
  </card>
`;

const EMPTY_CARDS = `
  <card>
  </card>
  <card>
  </card>
`;

const MARKDOWN_CARDS = `
  <card header="### Headers">
  </card>
  <card header="### Italics">
  </card>
`;

describe('CardStack', () => {
  test('should not hide cards when no filter is provided', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        blocks: '2',
        searchable: true,
      },
      slots: {
        default: CARDS_CUSTOMISATION,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('should not hide cards when no filter is provided', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        blocks: '2',
        searchable: true,
      },
      slots: {
        default: EMPTY_CARDS,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();

    const cardArray = wrapper.findAllComponents(Card);
    let visible = false;
    for (let i = 0; i < cardArray.length; i += 1) {
      if (cardArray.at(i).isVisible()) {
        visible = true;
        break;
      }
    }

    expect(visible).toBe(false);
    expect(wrapper.element).toMatchSnapshot();
  });

  test('markdown in header, content', async () => {
    const wrapper = mount(CardStack, {
      propsData: {
        blocks: '2',
        searchable: true,
      },
      slots: {
        default: MARKDOWN_CARDS,
      },
      global: DEFAULT_GLOBAL_MOUNT_OPTIONS,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });
});
