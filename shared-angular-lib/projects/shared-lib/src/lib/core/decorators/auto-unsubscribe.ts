import { Subscription } from "rxjs";

export const autoUnsubscribe = (target: any, propertyKey: string) => {
    const componentName = target?.contractor?.name;

    const originalOnInit = target.ngOnInit;
    target.ngOnInit = function(args: any){
        if(this[propertyKey] === undefined){
            this[propertyKey] = new Subscription();
        }
        if(!(this[propertyKey] instanceof Subscription)){
            console.warn(`wrong use of decorator in ${componentName}, property ${propertyKey} is not instance of Subscription`);
        }
        originalOnInit?.call(this, args);
    }

    const originalOnDestroy = target.ngOnDestroy;
    target.ngOnDestroy = function(args: any){
        if(this[propertyKey] instanceof Subscription){
            this[propertyKey].unsubscribe();
        }
        originalOnDestroy?.call(this, args);
    }

}