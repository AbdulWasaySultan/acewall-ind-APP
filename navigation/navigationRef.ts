import { createNavigationContainerRef } from "@react-navigation/native";

// Lets code outside the component tree (e.g. the preview-mode banner, which
// sits above the Drawer navigator) trigger navigation safely.
export const navigationRef = createNavigationContainerRef();
