interface State {
  [key: string]: boolean; // All state properties are boolean
}

interface Action {
  type: string;
}

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    /* Basic Alerts */
    case "basicprimary":
      return { ...state, basicprimary: false };
    case "basicsecondary":
      return { ...state, basicsecondary: false };
    case "basicsuccess":
      return { ...state, basicsuccess: false };
    case "basicinfo":
      return { ...state, basicinfo: false };
    case "basicwarning":
      return { ...state, basicwarning: false };
    case "basicdanger":
      return { ...state, basicdanger: false };
    case "basicdark":
      return { ...state, basicdark: false };
    case "basiclight":
      return { ...state, basiclight: false };

    /* Solid Color Alerts */
    case "solidprimary":
      return { ...state, solidprimary: false };
    case "solidsecondary":
      return { ...state, solidsecondary: false };
    case "solidsuccess":
      return { ...state, solidsuccess: false };
    case "solidinfo":
      return { ...state, solidinfo: false };
    case "solidwarning":
      return { ...state, solidwarning: false };
    case "soliddanger":
      return { ...state, soliddanger: false };
    case "soliddark":
      return { ...state, soliddark: false };
    case "solidlight":
      return { ...state, solidlight: false };

    /* Dismissable Alerts */
    case "disprimary":
      return { ...state, disprimary: false };
    case "dissecondary":
      return { ...state, dissecondary: false };
    case "dissuccess":
      return { ...state, dissuccess: false };
    case "disinfo":
      return { ...state, disinfo: false };
    case "diswarning":
      return { ...state, diswarning: false };
    case "disdanger":
      return { ...state, disdanger: false };
    case "disdark":
      return { ...state, disdark: false };
    case "dislight":
      return { ...state, dislight: false };

    /* Alert Alt */
    case "altprimary":
      return { ...state, altprimary: false };
    case "altsecondary":
      return { ...state, altsecondary: false };
    case "altsuccess":
      return { ...state, altsuccess: false };
    case "altinfo":
      return { ...state, altinfo: false };
    case "altwarning":
      return { ...state, altwarning: false };
    case "altdanger":
      return { ...state, altdanger: false };
    case "altdark":
      return { ...state, altdark: false };
    case "altlight":
      return { ...state, altlight: false };

    /* Solid  Alt*/
    case "altsolidprimary":
      return { ...state, altsolidprimary: false };
    case "altsolidsecondary":
      return { ...state, altsolidsecondary: false };
    case "altsolidsuccess":
      return { ...state, altsolidsuccess: false };
    case "altsolidinfo":
      return { ...state, altsolidinfo: false };
    case "altsolidwarning":
      return { ...state, altsolidwarning: false };
    case "altsoliddanger":
      return { ...state, altsoliddanger: false };
    case "altsoliddark":
      return { ...state, altsoliddark: false };
    case "altsolidlight":
      return { ...state, altsolidlight: false };

    // Dismissable With Solid
    case "soliddisprimary":
      return { ...state, soliddisprimary: false };
    case "soliddicsecondary":
      return { ...state, soliddisprimary: false };
    case "soliddissuccess":
      return { ...state, soliddissuccess: false };
    case "soliddisinfo":
      return { ...state, soliddisinfo: false };
    case "soliddiswarning":
      return { ...state, soliddiswarning: false };
    case "soliddisdanger":
      return { ...state, soliddisdanger: false };
    case "soliddisdark":
      return { ...state, soliddisdark: false };
    case "soliddislight":
      return { ...state, soliddislight: false };

    // Alert With Link
    case "linkprimary":
      return { ...state, linkprimary: false };
    case "linksecondary":
      return { ...state, linksecondary: false };
    case "linksuccess":
      return { ...state, linksuccess: false };
    case "linkinfo":
      return { ...state, linkinfo: false };
    case "linkwarning":
      return { ...state, linkwarning: false };
    case "linkdanger":
      return { ...state, linkdanger: false };
    case "linkdark":
      return { ...state, linkdark: false };
    case "linklight":
      return { ...state, linklight: false };

    // Alert With Link And Solid Color
    case "linksolidprimary":
      return { ...state, linksolidprimary: false };
    case "linksolidsecondary":
      return { ...state, linksolidsecondary: false };
    case "linksolidsuccess":
      return { ...state, linksolidsuccess: false };
    case "linksolidinfo":
      return { ...state, linksolidinfo: false };
    case "linksolidwarning":
      return { ...state, linksolidwarning: false };
    case "linksoliddanger":
      return { ...state, linksoliddanger: false };
    case "linksoliddark":
      return { ...state, linksoliddark: false };
    case "linksolidlight":
      return { ...state, linksolidlight: false };

    // Alert Icon Left
    case "iconprimary":
      return { ...state, iconprimary: false };
    case "iconsecondary":
      return { ...state, iconsecondary: false };
    case "iconsuccess":
      return { ...state, iconsuccess: false };
    case "iconinfo":
      return { ...state, iconinfo: false };
    case "iconwarning":
      return { ...state, iconwarning: false };
    case "icondanger":
      return { ...state, icondanger: false };
    case "icondark":
      return { ...state, icondark: false };
    case "iconlight":
      return { ...state, iconlight: false };

    //Alert Outline
    case "outlineprimary":
      return { ...state, outlineprimary: false };
    case "outlinesecondary":
      return { ...state, outlinesecondary: false };
    case "outlinesuccess":
      return { ...state, outlinesuccess: false };
    case "outlineinfo":
      return { ...state, outlineinfo: false };
    case "outlinewarning":
      return { ...state, outlinewarning: false };
    case "outlinedanger":
      return { ...state, outlinedanger: false };
    case "outlinedark":
      return { ...state, outlinedark: false };
    case "outlinelight":
      return { ...state, outlinelight: false };

    //Alert Social
    case "socialefacebook":
      return { ...state, socialefacebook: false };
    case "socialtwitter":
      return { ...state, socialtwitter: false };
    case "sociallinkdin":
      return { ...state, sociallinkdin: false };
    case "socialgoogle":
      return { ...state, socialgoogle: false };

    //Message Alert
    case "messageprimary":
      return { ...state, messageprimary: false };
    case "messagesecondary":
      return { ...state, messagesecondary: false };
    case "messagesuccess":
      return { ...state, messagesuccess: false };
    case "messageinfo":
      return { ...state, messageinfo: false };
    case "messagewarning":
      return { ...state, messagewarning: false };
    case "messagedanger":
      return { ...state, messagedanger: false };
    case "messagedark":
      return { ...state, messagedark: false };
    case "messagelight":
      return { ...state, messagelight: false };

    //Message Alert With Solid Color
    case "solidmessageprimary":
      return { ...state, solidmessageprimary: false };
    case "solidmessagesecondary":
      return { ...state, solidmessagesecondary: false };
    case "solidmessagesuccess":
      return { ...state, solidmessagesuccess: false };
    case "solidmessageinfo":
      return { ...state, solidmessageinfo: false };
    case "solidmessagewarning":
      return { ...state, solidmessagewarning: false };
    case "solidmessagedanger":
      return { ...state, solidmessagedanger: false };
    case "solidmessagedark":
      return { ...state, solidmessagedark: false };
    case "solidmessagelight":
      return { ...state, solidmessagelight: false };

    //Alert Left Icon Big
    case "iconbigprimary":
      return { ...state, iconbigprimary: false };
    case "iconbigwarning":
      return { ...state, iconbigwarning: false };
    case "iconbigsuccess":
      return { ...state, iconbigsuccess: false };
    case "iconbigdanger":
      return { ...state, iconbigdanger: false };

    default:
      return state;
  }
};
