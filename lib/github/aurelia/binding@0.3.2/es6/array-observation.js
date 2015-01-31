/* */ 
"format register";
import {calcSplices, projectArraySplices} from './array-change-records';

var arrayProto = Array.prototype,
    hasArrayObserve = (function detectArrayObserve() {
      if (typeof Array.observe !== 'function') {
        return false;
      }

      var records = [];

      function callback(recs) {
        records = recs;
      }

      var arr = [];
      Array.observe(arr, callback);
      arr.push(1, 2);
      arr.length = 0;

      Object.deliverChangeRecords(callback);
      if (records.length !== 2)
        return false;

      if (records[0].type != 'splice' ||
          records[1].type != 'splice') {
        return false;
      }

      Array.unobserve(arr, callback);

      return true;
    })();

export function getArrayObserver(taskQueue, array){
  if(hasArrayObserve){
    return new ArrayObserveObserver(array);
  }else{
    return ModifyArrayObserver.create(taskQueue, array);
  }
}

class ModifyArrayObserver {
  constructor(taskQueue, array){
    this.taskQueue = taskQueue;
    this.callbacks = [];
    this.changeRecords = [];
    this.queued = false;
    this.array = array;
    this.oldArray = null;
  }

  subscribe(callback){
    var callbacks = this.callbacks;
    callbacks.push(callback);
    return function(){
      callbacks.splice(callbacks.indexOf(callback), 1);
    };
  }

  addChangeRecord(changeRecord){
    if(!this.callbacks.length){
      return;
    }

    this.changeRecords.push(changeRecord);

    if(!this.queued){
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  reset(oldArray){
    if(!this.callbacks.length){
      return;
    }

    this.oldArray = oldArray;

    if(!this.queued){
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  getObserver(propertyName){
    if(propertyName == 'length'){
      return this.lengthObserver || (this.lengthObserver = new ArrayLengthObserver(this.array));
    }else{
      throw new Error(`You cannot observe the ${propertyName} property of an array.`);
    }
  }

  call(){
    var callbacks = this.callbacks,
        i = callbacks.length,
        changeRecords = this.changeRecords,
        oldArray = this.oldArray,
        splices;

    this.queued = false;
    this.changeRecords = [];
    this.oldArray = null;

    if(i){
      if(oldArray){
        //we might need to combine this with existing change records....
        splices = calcSplices(this.array, 0, this.array.length, oldArray, 0, oldArray.length);
      }else{
        splices = projectArraySplices(this.array, changeRecords);
      }

      while(i--) {
        callbacks[i](splices);
      }
    }

    if(this.lengthObserver){
      this.lengthObserver(this.array.length);
    }
  }

  static create(taskQueue, array){
    var observer = new ModifyArrayObserver(taskQueue, array);

    array['pop'] = function(){
      var methodCallResult = arrayProto['pop'].apply(array, arguments);
      observer.addChangeRecord({
       type: 'delete',
       object: array,
       name: array.length,
       oldValue: methodCallResult
      });
      return methodCallResult;
    }

    array['push'] = function(){
      var methodCallResult = arrayProto['push'].apply(array, arguments);
      observer.addChangeRecord({
       type: 'splice',
       object: array,
       index: array.length - arguments.length,
       removed: [],
       addedCount: arguments.length
      });
      return methodCallResult;
    }

    array['reverse'] = function(){
      var oldArray = array.slice();
      var methodCallResult = arrayProto['reverse'].apply(array, arguments);
      observer.reset(oldArray);
      return methodCallResult;
    }

    array['shift'] = function() {
      var methodCallResult = arrayProto['shift'].apply(array, arguments);
      observer.addChangeRecord({
       type: 'delete',
       object: array,
       name: 0,
       oldValue: methodCallResult
      });
      return methodCallResult
    };

    array['sort'] = function() {
      var oldArray = array.slice();
      var methodCallResult = arrayProto['sort'].apply(array, arguments);
      observer.reset(oldArray);
      return methodCallResult;
    };

    array['splice'] = function() {
      var methodCallResult = arrayProto['splice'].apply(array, arguments);
      observer.addChangeRecord({
       type: 'splice',
       object: array,
       index: arguments[0],
       removed: methodCallResult,
       addedCount: arguments.length > 2 ? arguments.length - 2 : 0
      });
      return methodCallResult;
    };

    array['unshift'] = function() {
      var methodCallResult = arrayProto['unshift'].apply(array, arguments);
      observer.addChangeRecord({
       type: 'splice',
       object: array,
       index: 0,
       removed: [],
       addedCount: arguments.length
      });
      return methodCallResult;
    };

    return observer;
  }
}

class ArrayObserveObserver {
  constructor(array){
    this.array = array;
    this.callbacks = [];
    this.observing = false;
  }

  subscribe(callback){
    var callbacks = this.callbacks;

    callbacks.push(callback);

    if(!this.observing){
      this.observing = true;
      Array.observe(this.array, changes => this.handleChanges(changes));
    }

    return function(){
      callbacks.splice(callbacks.indexOf(callback), 1);
    };
  }

  getObserver(propertyName){
    if(propertyName == 'length'){
      return this.lengthObserver || (this.lengthObserver = new ArrayLengthObserver(this.array));
    }else{
      throw new Error(`You cannot observe the ${propertyName} property of an array.`);
    }
  }

  handleChanges(changeRecords){
    var callbacks = this.callbacks,
        i = callbacks.length,
        splices;

    if(!i){
      return;
    }

    var splices = projectArraySplices(this.array, changeRecords);

    while(i--) {
      callbacks[i](splices);
    }

    if(this.lengthObserver){
      this.lengthObserver.call(this.array.length);
    }
  }
}

class ArrayLengthObserver {
  constructor(array){
    this.array = array;
    this.callbacks = [];
    this.currentValue = array.length;
  }

  getValue(){
    return this.array.length;
  }

  setValue(newValue){
    this.array.length = newValue;
  }

  subscribe(callback){
    var callbacks = this.callbacks;
    callbacks.push(callback);
    return function(){
      callbacks.splice(callbacks.indexOf(callback), 1);
    };
  }

  call(newValue){
    var callbacks = this.callbacks,
        i = callbacks.length,
        oldValue = this.currentValue;

    while(i--) {
      callbacks[i](newValue, oldValue);
    }

    this.currentValue = newValue;
  }
}