import bb.cascades 1.3

NavigationPane {
    id: navigationPane

    Menu.definition: MenuDefinition {
        settingsAction: SettingsActionItem {
            title: qsTr("Settings")
            onTriggered: {
                navigationPane.push(settingsPage);
            }
        }
        helpAction: HelpActionItem {
            title: qsTr("Info")
            imageSource: "asset:///images/icons/info.png"
            onTriggered: {
                app.showToast("České a slovenské online rádiá v jednej aplikácii určenej pre BlackBerry 10 \n Autor: Tomáš Taro\n Licencia: GPL v3");
            }
        }
    }

    Page {
        Container {
            ScrollView {
                WebView {
                    id: myWebView
                    url: "local:///assets/simple.html"
                    settings.webInspectorEnabled: true
                    
                    function getTime(h,m,s) {
                        var h = h * 3600000;
                        var m = m * 60000;
                        var s = s * 1000;
                        var time = h+m+s;
                        myWebView.postMessage(parseInt(time));
                    }
                }
            }
        }

        actions: [
            ActionItem {
                title: "CZ rádiá"
                ActionBar.placement: ActionBarPlacement.OnBar
                imageSource: "asset:///images/icons/info.png"
                onTriggered: {
                    myWebView.postMessage("scrollToCZ");
                }
            },
            ActionItem {
                title: "Stop"
                ActionBar.placement: ActionBarPlacement.Signature
                imageSource: "asset:///images/icons/stop.png"
                onTriggered: {
                    myWebView.postMessage("stop");
                }
            },
            ActionItem {
                title: "SK rádiá"
                ActionBar.placement: ActionBarPlacement.OnBar
                imageSource: "asset:///images/icons/info.png"
                onTriggered: {
                    myWebView.postMessage("scrollToSK");
                }
            }
        ]

        onCreationCompleted: {
            // enable layout to adapt to the device rotation
            // don't forget to enable screen rotation in bar-bescriptor.xml (Application->Orientation->Auto-orient)
            OrientationSupport.supportedDisplayOrientation = SupportedDisplayOrientation.All;
        }
    }

    attachedObjects: [
        Page {
            id: settingsPage            
            
            content: Container {
                Button {
                    text: "Zmeň tému"

                    // Checks the current theme and then flips the value
                    onClicked: {
                        if (Application.themeSupport.theme.colorTheme.style == VisualStyle.Bright) {
                            Application.themeSupport.setVisualStyle(VisualStyle.Dark);
                        }
                        else {
                            Application.themeSupport.setVisualStyle(VisualStyle.Bright);
                        }
                    }
                }
                DateTimePicker {
                    id: picker
                    title: "Časovač"
                    mode: DateTimePickerMode.Timer
                    value: picker.dateFromTime("00:00:00")
                    onValueChanged: {
                        myWebView.getTime(value.getHours(), value.getMinutes(), value.getSeconds());
                    }
                }
            }
        }
    ] // end of attachedObjects list
} // end of NavigationPane