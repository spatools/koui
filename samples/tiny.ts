/// <amd-dependency path="tinymce-plugins-textcolor" />

import "../src/tinymce";
import * as ko from "knockout";

const defaultVal = "Maecenas nec ipsum sed sapien venenatis imperdiet et vitae nibh. In mattis lacus nibh, eget rutrum lectus dapibus sit amet. Donec tristique vel orci quis pharetra. Morbi mollis massa sit amet elit ornare pulvinar. Donec quis lectus molestie, fermentum sapien eget, sodales turpis. Cras sed arcu vitae turpis porta adipiscing. Etiam mattis quam ac dictum sagittis.";

export const
    value = ko.observable(defaultVal),
    
    options = {
        value: value,
        "browser_spellcheck": true,
        "plugins": ["textcolor"],
        "toolbar": "undo redo | fontselect fontsizeselect forecolor | bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify",
        "skin": false,
        "menubar": false,
        "statusbar": false
    };
