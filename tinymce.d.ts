declare module "knockout" {
    interface BindingHandlers {
        tinymce: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
    }
}
export {};
