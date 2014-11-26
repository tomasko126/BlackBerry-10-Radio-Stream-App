import bb.cascades 1.3

Page {
    Container {
        Label { 
            text: "Second page"
        }
    }
    paneProperties: NavigationPaneProperties {
        backButton: ActionItem {
            title: "Previous page"
            onTriggered: { navigationPane.pop(); }
        }
    }
}