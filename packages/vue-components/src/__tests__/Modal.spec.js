import { mount } from '@vue/test-utils';
import { createVfm } from 'vue-final-modal';
import { nextTick } from 'vue';
import Modal from '../Modal.vue';
import Trigger from '../Trigger.vue';

const TRIGGER_STUB = {
  props: {
    for: 'modal:test',
    trigger: 'click',
  },
  slots: {
    default: 'Trigger for a modal',
  },
  global: {
    stubs: {
      'v-tooltip': true,
      'v-popover': true,
      teleport: true,
    },
  },
};

const DEFAULT_MODAL_HEADER = 'test modal header';
const DEFAULT_MODAL_FOOTER = 'test modal footer';
const DEFAULT_MODAL_CONTENT = 'Lorem ipsum dolor sit amet, '
  + 'consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

describe('Modal', () => {
  let vfm;
  let wrapper;

  beforeEach(() => {
    vfm = createVfm();
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    document.body.innerHTML = '';
  });

  const mountModal = async (props = {}, slots = {}) => {
    wrapper = mount(Modal, {
      props,
      slots,
      global: {
        plugins: [vfm],
      },
      attachTo: document.body,
    });
    await wrapper.setData({ show: true, isMounted: true });
    await nextTick();
    await nextTick();
    return wrapper;
  };

  const snapshotModalContent = () => {
    // Snapshot the entire modal wrapper to capture transitions and full structure
    const modalContent = document.body.querySelector('.modal');
    expect(modalContent).toMatchSnapshot();
  };

  test('should be triggered by Trigger component', async () => {
    jest.spyOn(vfm, 'open').mockImplementation(() => Promise.resolve());
    wrapper = mount(Modal, {
      props: {
        id: 'modal:test',
      },
      slots: {
        default: DEFAULT_MODAL_CONTENT,
      },
      global: {
        plugins: [vfm],
        stubs: {
          teleport: true,
        },
      },
    });
    const trigger = mount(Trigger, {
      ...TRIGGER_STUB,
      global: {
        ...TRIGGER_STUB.global,
        plugins: [vfm],
      },
    });

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');
    expect(vfm.open).toHaveBeenCalledWith('modal:test');
  });

  test('should not show header when no header is given', async () => {
    await mountModal(
      { id: 'modal:test' },
      {
        default: DEFAULT_MODAL_CONTENT,
        footer: DEFAULT_MODAL_FOOTER,
      },
    );
    snapshotModalContent();
  });

  test('should not show footer when no footer is given', async () => {
    await mountModal(
      { id: 'modal:test' },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );
    snapshotModalContent();
  });

  test('should show footer when both footer and ok-text are given', async () => {
    await mountModal(
      {
        id: 'modal:test',
        'ok-text': 'test OK button',
      },
      {
        default: DEFAULT_MODAL_CONTENT,
        footer: DEFAULT_MODAL_FOOTER,
      },
    );
    snapshotModalContent();
  });

  test('should be closable by clicking the backdrop by default', async () => {
    await mountModal(
      { id: 'modal:test' },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );

    // Verify clickToClose prop is true by default
    const vfmComponent = wrapper.findComponent({ name: 'VueFinalModal' });
    expect(vfmComponent.exists()).toBe(true);
    expect(vfmComponent.props('clickToClose')).toBe(true); // default true

    snapshotModalContent();
  });

  test('should not be closable by clicking the backdrop if backdrop is set as false', async () => {
    await mountModal(
      {
        id: 'modal:test',
        backdrop: 'false',
      },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );

    // Verify clickToClose prop is false
    const vfmComponent = wrapper.findComponent({ name: 'VueFinalModal' });
    expect(vfmComponent.props('clickToClose')).toBe(false);

    snapshotModalContent();
  });

  test('should be closable using the ok-text button', async () => {
    await mountModal(
      {
        id: 'modal:test',
        'ok-text': 'test OK button',
      },
      {
        default: DEFAULT_MODAL_CONTENT,
      },
    );

    // Verify button exists in body (outside wrapper)
    const okBtn = document.body.querySelector('.modal-footer .btn-primary');
    expect(okBtn).not.toBeNull();

    // Snapshot the actual rendered modal content
    const modalContent = document.body.querySelector('.vfm__content');
    expect(modalContent).toMatchSnapshot();

    // Simulate click
    await okBtn.click();
    await nextTick();

    // Verify modal is closed
    expect(wrapper.vm.show).toBe(false);
  });

  test('supports fade effect', async () => {
    await mountModal(
      {
        id: 'modal:test',
        effect: 'fade',
      },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );
    snapshotModalContent();
  });

  test('can be small', async () => {
    await mountModal(
      {
        id: 'modal:test',
        small: true,
      },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );
    snapshotModalContent();
  });

  test('can be large', async () => {
    await mountModal(
      {
        id: 'modal:test',
        large: true,
      },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );
    snapshotModalContent();
  });

  test('can be centered', async () => {
    await mountModal(
      {
        id: 'modal:test',
        center: true,
      },
      {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    );
    snapshotModalContent();
  });
});
