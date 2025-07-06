import { mount } from '@vue/test-utils';
import { Dropdown } from 'floating-vue';
import Annotation from '../annotations/Annotate.vue';
import AnnotationPoint from '../annotations/AnnotatePoint.vue';

const DEFAULT_STUBS = {
  'a-point': AnnotationPoint,
  'v-popover': Dropdown,
};

const ANNOTATION_POINTS = `
  <a-point x="25%" y="25%" content="25% from the left and 25% from the top" />
  <a-point x="50%" y="25%" content="50% from the left and 25% from the top"  size="60"/>
  <a-point x="75%" y="25%" content="75% from the left and 25% from the top"  header="This has a header"/>
  <a-point x="33%" y="50%" content="33% from the left and 50% from the top"  color="red"/>
  <a-point x="66%" y="50%" content="66% from the left and 50% from the top"  opacity="0.7"/>
  <a-point x="25%" y="75%" content="25% from the left and 75% from the top" label="1"/>
  <a-point x="50%" y="75%" content="50% from the left and 75% from the top" 
    textColor="white" color="black" label="2" opacity="1"/>
  <a-point x="75%" y="75%" content="75% from the left and 75% from the top"  fontSize="30" label="3"/>
`;

const CUSTOMISED_ANNOTATION_POINTS = `
  <a-point x="25%" y="25%" content="25% from the left and 25% from the top">
    <div style="color:red">Hi</div>
  </a-point>
  <a-point x="75%" y="75%" content="75% from the left and 75% from the top">
  <span class="badge bg-primary">Primary</span>
  </a-point>
`;

const MARKDOWN_ANNOTATION_POINTS = `
  <a-point x="25%" y="25%" content="[link](https://markbind.org/userGuide/gettingStarted.html)" />
  <a-point x="50%" y="50%" header="### Header" />
  <a-point x="75%" y="75%" label=":rocket:" />
`;

beforeAll(() => {
  global.ResizeObserver = class {
    constructor() {
      this.observe = jest.fn();
      this.unobserve = jest.fn();
      this.disconnect = jest.fn();
    }
  };
});

afterAll(() => {
  delete global.ResizeObserver;
});

describe('Annotation', () => {
  test('with different visual annotation points', async () => {
    const wrapper = mount(Annotation, {
      props: {
        src: './annotateSampleImage.png',
      },
      slots: {
        default: ANNOTATION_POINTS,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with customised annotation points', async () => {
    const wrapper = mount(Annotation, {
      props: {
        src: './annotateSampleImage.png',
      },
      slots: {
        default: CUSTOMISED_ANNOTATION_POINTS,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('with markdown in header, content and label', async () => {
    const wrapper = mount(Annotation, {
      props: {
        src: './annotateSampleImage.png',
      },
      slots: {
        default: MARKDOWN_ANNOTATION_POINTS,
      },
      global: {
        stubs: DEFAULT_STUBS,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });
});
