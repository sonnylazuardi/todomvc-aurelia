/* */ 
System.register([], function (_export) {
  "use strict";

  var _prototypeProperties, COMPLETED, CANCELLED, REJECTED, RUNNING, Pipeline;
  function createResult(ctx, next) {
    return {
      status: next.status,
      context: ctx,
      output: next.output,
      completed: next.status == COMPLETED
    };
  }

  return {
    setters: [],
    execute: function () {
      _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

      COMPLETED = _export("COMPLETED", "completed");
      CANCELLED = _export("CANCELLED", "cancelled");
      REJECTED = _export("REJECTED", "rejected");
      RUNNING = _export("RUNNING", "running");
      Pipeline = _export("Pipeline", (function () {
        function Pipeline() {
          this.steps = [];
        }

        _prototypeProperties(Pipeline, null, {
          withStep: {
            value: function withStep(step) {
              var run;

              if (typeof step == "function") {
                run = step;
              } else {
                run = step.run.bind(step);
              }

              this.steps.push(run);

              return this;
            },
            writable: true,
            configurable: true
          },
          run: {
            value: function run(ctx) {
              var index = -1,
                  steps = this.steps,
                  next,
                  currentStep;

              next = function () {
                index++;

                if (index < steps.length) {
                  currentStep = steps[index];

                  try {
                    return currentStep(ctx, next);
                  } catch (e) {
                    return next.reject(e);
                  }
                } else {
                  return next.complete();
                }
              };

              next.complete = function (output) {
                next.status = COMPLETED;
                next.output = output;
                return Promise.resolve(createResult(ctx, next));
              };

              next.cancel = function (reason) {
                next.status = CANCELLED;
                next.output = reason;
                return Promise.resolve(createResult(ctx, next));
              };

              next.reject = function (error) {
                next.status = REJECTED;
                next.output = error;
                return Promise.reject(createResult(ctx, next));
              };

              next.status = RUNNING;

              return next();
            },
            writable: true,
            configurable: true
          }
        });

        return Pipeline;
      })());
    }
  };
});