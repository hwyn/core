import { __rest } from "tslib";
import { isEmpty } from 'lodash';
const filterRoute = ({ component, loadModule }) => !!component || !!loadModule;
const toArray = (obj) => Array.isArray(obj) ? obj : [obj];
function stackFunction(stackArray) {
    const stack = stackArray;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { add: (obj) => stack.push(obj), run: (handler) => { while (stack.length)
            handler(stack.shift()); } };
}
export const addRouterKey = (router, flag = 'root') => {
    const stack = stackFunction(toArray(router).map((r, index) => ({ router: r, flag: `${flag}-${index}` })));
    stack.run(({ router: stackRouter, flag: staciFlag }) => {
        const { children } = stackRouter;
        stackRouter.flag = staciFlag;
        if (!isEmpty(children)) {
            children.forEach((r, index) => stack.add({ router: r, flag: `${flag}-${index}` }));
        }
    });
};
export const serializeRouter = (router, parentRouter) => {
    const stack = stackFunction(toArray(router).map((r) => ({ router: r, parentRouter })));
    const routerInfoList = [];
    stack.run(({ router: stackRouter, parentRouter: stackParentRouter = {} }) => {
        const { children = [] } = stackRouter, routeInfo = __rest(stackRouter, ["children"]);
        const { path: parentPath = ``, list: parentList = [] } = stackParentRouter;
        const routePath = `${parentPath}/${routeInfo.path || ''}`.replace(/[/]{1,}/ig, '/');
        const list = [routeInfo, ...parentList].filter(filterRoute);
        if (!isEmpty(children)) {
            children.forEach((r) => stack.add({ router: r, parentRouter: { path: routePath, list } }));
        }
        else if (list.length) {
            routerInfoList.push({ path: routePath, list });
        }
    });
    return routerInfoList;
};