/* */ 
"format register";
import {Metadata} from 'aurelia-metadata';
import {BehaviorProperty, OptionsProperty} from './property';
import {AttachedBehavior} from './attached-behavior';
import {ChildObserver} from './children';
import {CustomElement, UseShadowDOM} from './custom-element';
import {ElementConfig} from './element-config';
import {TemplateController} from './template-controller';
import {UseView, NoView} from './view-strategy';

export {AttachedBehavior} from './attached-behavior';
export {BehaviorProperty, OptionsProperty} from './property';
export {ResourceCoordinator} from './resource-coordinator';
export {ResourceRegistry, ViewResources} from './resource-registry';
export {ChildObserver} from './children';
export {CustomElement, UseShadowDOM} from './custom-element';
export {ElementConfig} from './element-config';
export {TemplateController} from './template-controller';
export {ViewStrategy, UseView, ConventionalView, NoView} from './view-strategy';
export {ViewCompiler} from './view-compiler';
export {ViewEngine} from './view-engine';
export {ViewFactory, BoundViewFactory} from './view-factory';
export {ViewSlot} from './view-slot';
export {BindingLanguage} from './binding-language';
export {CompositionEngine} from './composition-engine';

export var Behavior = Metadata;

Metadata.configure.classHelper('withProperty', BehaviorProperty);
Metadata.configure.classHelper('withOptions', OptionsProperty);
Metadata.configure.classHelper('attachedBehavior', AttachedBehavior);
Metadata.configure.classHelper('syncChildren', ChildObserver);
Metadata.configure.classHelper('customElement', CustomElement);
Metadata.configure.classHelper('useShadowDOM', UseShadowDOM);
Metadata.configure.classHelper('elementConfig', ElementConfig);
Metadata.configure.classHelper('templateController', TemplateController);
Metadata.configure.classHelper('useView', UseView);
Metadata.configure.classHelper('noView', NoView);