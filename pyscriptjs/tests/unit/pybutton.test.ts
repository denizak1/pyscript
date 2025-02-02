import { jest } from '@jest/globals';
import type { Runtime } from "../../src/runtime"
import { FakeRuntime } from "./fakeruntime"
import { make_PyButton } from '../../src/components/pybutton';

const runtime: Runtime = new FakeRuntime();
const PyButton = make_PyButton(runtime);
customElements.define('py-button', PyButton);

describe('PyButton', () => {
    let instance;
    beforeEach(() => {
        instance = new PyButton();
    });

    it('should get the Button to just instantiate', async () => {
        expect(instance).toBeInstanceOf(PyButton);
    });

    it('onCallback gets or sets a new id', async () => {
        expect(instance.id).toBe('');

        instance.connectedCallback();
        const instanceId = instance.id;
        // id should be similar to py-4850c8c3-d70d-d9e0-03c1-3cfeb0bcec0d-container
        expect(instanceId).toMatch(/py-(\w+-){1,5}container/);

        // calling checkId directly should return the same id
        instance.checkId();
        expect(instance.id).toEqual(instanceId);
    });

    it('onCallback updates on_click code and function name ', async () => {
        expect(instance.code).toBe(undefined);
        expect(instance.innerHTML).toBe('');

        instance.innerHTML = '\ndef on_click(e):\n';

        instance.connectedCallback();

        expect(instance.code).toMatch(/def\son_click_py_(\w+)\(e\)/);
        expect(instance.innerHTML).toContain('<button class="py-button"');
    });

    it('onCallback updates on_focus code and function name', async () => {
        expect(instance.code).toBe(undefined);
        expect(instance.innerHTML).toBe('');

        instance.innerHTML = '\ndef on_focus(e):\n';

        instance.connectedCallback();

        expect(instance.code).toMatch(/def\son_focus_py_(\w+)\(e\)/);
        expect(instance.innerHTML).toContain('<button class="py-button"');
    });

    it('onCallback sets mount_name based on id', async () => {
        expect(instance.id).toBe('');
        expect(instance.mount_name).toBe(undefined);

        instance.connectedCallback();

        const instanceId = instance.id;

        expect(instanceId).toMatch(/py-(\w+-){1,5}container/);
        expect(instance.mount_name).toBe(instanceId.replace('-container', '').split('-').join('_'));
    });
});
