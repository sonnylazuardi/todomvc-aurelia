/* */ 
"format register";
import {Metadata, Origin, ResourceType} from 'aurelia-metadata';
import {BehaviorInstance} from './behavior-instance';
import {configureBehavior} from './behaviors';
import {ContentSelector} from './content-selector';
import {ViewEngine} from './view-engine';
import {ViewStrategy} from './view-strategy';
import {hyphenate} from './util';

var defaultInstruction = { suppressBind:false },
    contentSelectorFactoryOptions = { suppressBind:true },
    hasShadowDOM = !!HTMLElement.prototype.createShadowRoot,
    valuePropertyName = 'value';

export class UseShadowDOM {}

export class CustomElement extends ResourceType {
  constructor(tagName){
    this.name = tagName;
    this.properties = [];
    this.attributes = {};
  }

  static convention(name){
    if(name.endsWith('CustomElement')){
      return new CustomElement(hyphenate(name.substring(0, name.length-13)));
    }
  }

  analyze(container, target){
    configureBehavior(container, this, target, valuePropertyName);
    
    this.configured = true;
    this.targetShadowDOM = Metadata.on(target).has(UseShadowDOM);
    this.usesShadowDOM = this.targetShadowDOM && hasShadowDOM;
  }

  load(container, target, viewStrategy){
    var options;

    viewStrategy = viewStrategy || ViewStrategy.getDefault(target);
    options = { targetShadowDOM:this.targetShadowDOM };

    if(!viewStrategy.moduleId){
      viewStrategy.moduleId = Origin.get(target).moduleId;
    }

    return viewStrategy.loadViewFactory(container.get(ViewEngine), options).then(viewFactory => {
      this.viewFactory = viewFactory;
      return this;
    });
  }

  register(registry, name){
    registry.registerElement(name || this.name, this);
  }

  compile(compiler, resources, node, instruction){
    if(!this.usesShadowDOM && node.hasChildNodes()){
      var fragment = document.createDocumentFragment(),
          currentChild = node.firstChild,
          nextSibling;

      while (currentChild) {
        nextSibling = currentChild.nextSibling;
        fragment.appendChild(currentChild);
        currentChild = nextSibling;
      }

      instruction.contentFactory = compiler.compile(fragment, resources);
    }

    instruction.suppressBind = true;
    
    return node;
  }

  create(container, instruction=defaultInstruction, element=null){
    var executionContext = instruction.executionContext || container.get(this.target),
        behaviorInstance = new BehaviorInstance(this, executionContext, instruction),
        host;

    if(this.viewFactory){
      behaviorInstance.view = this.viewFactory.create(container, behaviorInstance.executionContext, instruction);
    }

    if(element){
      element.elementBehavior = behaviorInstance;
      element.primaryBehavior = behaviorInstance;

      if(behaviorInstance.view){
        if(this.usesShadowDOM) {
          host = element.createShadowRoot();
        }else{
          host = element;

          if(instruction.contentFactory){
            var contentView = instruction.contentFactory.create(container, null, contentSelectorFactoryOptions);

            ContentSelector.applySelectors(
              contentView, 
              behaviorInstance.view.contentSelectors, 
              (contentSelector, group) => contentSelector.add(group)
              );

            behaviorInstance.contentView = contentView;
          }
        }

        if(this.childExpression){
          behaviorInstance.view.addBinding(this.childExpression.createBinding(host, behaviorInstance.executionContext));
        }

        behaviorInstance.view.appendNodesTo(host);
      }
    }else if(behaviorInstance.view){
      behaviorInstance.view.owner = behaviorInstance;
    }

    return behaviorInstance;
  }
}