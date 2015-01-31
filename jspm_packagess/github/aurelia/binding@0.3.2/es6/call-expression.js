/* */ 
"format register";
export class CallExpression {
  constructor(observerLocator, targetProperty, sourceExpression, valueConverterLookupFunction){
    this.observerLocator = observerLocator;
    this.targetProperty = targetProperty;
    this.sourceExpression = sourceExpression;
    this.valueConverterLookupFunction = valueConverterLookupFunction;
  }

  createBinding(target){
    return new Call(
      this.observerLocator,
      this.sourceExpression,
      target,
      this.targetProperty,
      this.valueConverterLookupFunction
      );
  }
}

class Call {
  constructor(observerLocator, sourceExpression, target, targetProperty, valueConverterLookupFunction){
    this.sourceExpression = sourceExpression
    this.target = target;
    this.targetProperty = observerLocator.getObserver(target, targetProperty);
    this.valueConverterLookupFunction = valueConverterLookupFunction;
  }

  bind(source){
    if(this.source === source){
      return;
    }

    if(this.source){
      this.unbind();
    }

    this.source = source;
    this.targetProperty.setValue((...rest) => {
      return this.sourceExpression.evaluate(source, this.valueConverterLookupFunction, rest);
    });
  }

  unbind(){
    this.targetProperty.setValue(null);
  }
}