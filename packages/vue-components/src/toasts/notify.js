// eslint-disable-next-line import/no-extraneous-dependencies
import { notify } from 'alertifyjs';

// Doing this directly in Toast.vue will cause the mounted method to be called more than once
export default notify;
