import { mount } from '@vue/test-utils';
import Modal from '../Modal.vue';
import Trigger from '../Trigger.vue';

const TRIGGER_STUB = {
  propsData: {
    for: 'modal:test',
    trigger: 'click',
  },
  slots: {
    default: 'Trigger for a modal',
  }
}

const DEFAULT_MODAL_HEADER = 'test modal header'
const DEFAULT_MODAL_FOOTER = 'test modal footer'
const DEFAULT_MODAL_CONTENT = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

describe('Modal', () => {
  test('should not show header when no header is given', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
      },
      slots: {
        default: DEFAULT_MODAL_CONTENT,
        footer: DEFAULT_MODAL_FOOTER,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should not show footer when no footer is given', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
      },
      slots: {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should show footer when both footer and ok-text are given', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        'ok-text': 'test OK button',
      },
      slots: {
        default: DEFAULT_MODAL_CONTENT,
        footer: DEFAULT_MODAL_FOOTER,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should be closable by clicking the backdrop by default', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
      },
      slots: {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');
    // then click on backdrop
    await wrapper.find('div.allow-overflow').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should not be closable by clicking the backdrop if backdrop is set as false', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        backdrop: 'false',
      },
      slots: {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');
    // then click on backdrop
    await wrapper.find('div.allow-overflow').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('should be closable using the ok-text button', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        'ok-text': 'test OK button',
      },
      slots: {
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');
    // click on OK button
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('supports fade effect', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        effect: 'fade',
        header: DEFAULT_MODAL_HEADER,
      },
      slots: {
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('can be small', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        small: true,
      },
      slots: {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('can be large', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        large: true,
      },
      slots: {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  test('can be centered', async () => {
    const wrapper = mount(Modal, {
      propsData: {
        id: 'modal:test',
        center: true,
      },
      slots: {
        header: DEFAULT_MODAL_HEADER,
        default: DEFAULT_MODAL_CONTENT,
      },
    });
    const trigger = mount(Trigger, TRIGGER_STUB);

    // click on trigger
    await trigger.find('span.trigger-click').trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });
});
