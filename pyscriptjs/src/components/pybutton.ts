import { BaseEvalElement } from './base';
import { addClasses, htmlDecode } from '../utils';
import { getLogger } from '../logger'
import type { Runtime } from '../runtime';

const logger = getLogger('py-button');

export function make_PyButton(runtime: Runtime) {
    class PyButton extends BaseEvalElement {
        widths: Array<string>;
        label: string;
        class: Array<string>;
        defaultClass: Array<string>;
        mount_name: string;
        constructor() {
            super();

            this.defaultClass = ['py-button'];

            if (this.hasAttribute('label')) {
                this.label = this.getAttribute('label');
            }

            // Styling does the same thing as class in normal HTML. Using the name "class" makes the style to malfunction
            if (this.hasAttribute('styling')) {
                const klass = this.getAttribute('styling').trim();
                if (klass === '') {
                    this.class = this.defaultClass;
                } else {
                    // trim each element to remove unnecessary spaces which makes the button style to malfunction
                    this.class = klass
                        .split(' ')
                        .map(x => x.trim())
                        .filter(x => x !== '');
                }
            } else {
                this.class = this.defaultClass;
            }
        }

        async connectedCallback() {
            this.checkId();
            this.code = htmlDecode(this.innerHTML);
            this.mount_name = this.id.split('-').join('_');
            this.innerHTML = '';

            const mainDiv = document.createElement('button');
            mainDiv.innerHTML = this.label;
            addClasses(mainDiv, this.class);

            mainDiv.id = this.id;
            this.id = `${this.id}-container`;

            this.appendChild(mainDiv);
            this.code = this.code.split('self').join(this.mount_name);
            let registrationCode = `from pyodide.ffi import create_proxy`;
            registrationCode += `\n${this.mount_name} = Element("${mainDiv.id}")`;
            if (this.code.includes('def on_focus')) {
                this.code = this.code.replace('def on_focus', `def on_focus_${this.mount_name}`);
                registrationCode += `\n${this.mount_name}.element.addEventListener('focus', create_proxy(on_focus_${this.mount_name}))`;
            }

            if (this.code.includes('def on_click')) {
                this.code = this.code.replace('def on_click', `def on_click_${this.mount_name}`);
                registrationCode += `\n${this.mount_name}.element.addEventListener('click', create_proxy(on_click_${this.mount_name}))`;
            }

            // now that we appended and the element is attached, lets connect with the event handlers
            // defined for this widget
            await runtime.runButDontRaise(this.code);
            await runtime.runButDontRaise(registrationCode);
            logger.debug('py-button connected');
        }
    }

    return PyButton;
}
