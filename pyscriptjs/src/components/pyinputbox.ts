import { BaseEvalElement } from './base';
import { addClasses, htmlDecode } from '../utils';
import { getLogger } from '../logger'
import type { Runtime } from '../runtime';

const logger = getLogger('py-inputbox');

export function make_PyInputBox(runtime: Runtime) {
    class PyInputBox extends BaseEvalElement {
        widths: Array<string>;
        label: string;
        mount_name: string;
        constructor() {
            super();

            if (this.hasAttribute('label')) {
                this.label = this.getAttribute('label');
            }
        }

        async connectedCallback() {
            this.checkId();
            this.code = htmlDecode(this.innerHTML);
            this.mount_name = this.id.split('-').join('_');
            this.innerHTML = '';

            const mainDiv = document.createElement('input');
            mainDiv.type = 'text';
            addClasses(mainDiv, ['py-input']);

            mainDiv.id = this.id;
            this.id = `${this.id}-container`;
            this.appendChild(mainDiv);

            // now that we appended and the element is attached, lets connect with the event handlers
            // defined for this widget
            this.appendChild(mainDiv);
            this.code = this.code.split('self').join(this.mount_name);
            let registrationCode = `from pyodide.ffi import create_proxy`;
            registrationCode += `\n${this.mount_name} = Element("${mainDiv.id}")`;
            if (this.code.includes('def on_keypress')) {
                this.code = this.code.replace('def on_keypress', `def on_keypress_${this.mount_name}`);
                registrationCode += `\n${this.mount_name}.element.addEventListener('keypress', create_proxy(on_keypress_${this.mount_name}))`;
            }

            await runtime.runButDontRaise(this.code);
            await runtime.runButDontRaise(registrationCode);
            logger.debug('py-inputbox connected');
        }
    }

    return PyInputBox;
}
