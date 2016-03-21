import * as ko from "knockout";
import * as engine from "../src/engine";

const 
    main = document.getElementById("main"),
    nav = document.getElementsByTagName("nav")[0],
    home = "contextmenu";
    
let current: any;

engine.setTemplateEngine();

window.addEventListener("hashchange", onHashChange, false);
onHashChange();

function onHashChange() {
    const id = location.hash.slice(1);
    createSection(id || home);
}

function createSection(id) {
    if (id === current) {
        return;
    }
    
    require(
        ["./" + id, "text!./" + id + ".html"],
        function (vm, view) {
            cleanMain();
            
            main.innerHTML = view;
            ko.applyBindings(vm, main);
            selectActive(id);
            
            current = id;
        },
        function (err) {
            cleanMain();
            
            main.innerHTML = `An error occured: ${err}<br />${(<any>err).stack}`;
            selectActive("error");
            
            current = null;
        });
}

function selectActive(id) {
    const links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    links.forEach((link) => {
        if (link.getAttribute("href").indexOf(id) === 1) {
            link.classList.add("active");
        }
        else {
            link.classList.remove("active");
        }
    });
}

function cleanMain() {
    ko.cleanNode(main);
    
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
}
