import bb.cascades 1.4

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
                app.showToast("České a slovenské online rádiá pre BB10 \n Autor: Tomáš Taro");
            }
        }
    }

    Page {
        Container {
            WebView {
                id: myWebView
                url: "local:///assets/index.html"
                navigation.defaultHighlightEnabled: false
                settings.zoomToFitEnabled: true
                settings.webInspectorEnabled: true
                onMessageReceived: {
                    if (message.data === "playing") {
                        button.title = "Stop";
                        button.imageSource = "asset:///images/icons/stop.png";
                    }
                }

                function getTime(h, m, s) {
                    var h = h * 3600000;
                    var m = m * 60000;
                    var s = s * 1000;
                    var time = h + m + s;
                    myWebView.postMessage(parseInt(time));
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
                    console.log("czradio");
                }
            },
            ActionItem {
                id: button
                title: "Play"
                ActionBar.placement: ActionBarPlacement.Signature
                imageSource: "asset:///images/icons/play.png"
                onTriggered: {
                    if (button.title === "Play") {
                        myWebView.postMessage("play");
                        button.title = "Stop";
                        button.imageSource = "asset:///images/icons/stop.png";
                    } else {
                        myWebView.postMessage("stop");
                        button.title = "Play";
                        button.imageSource = "asset:///images/icons/play.png";
                    }
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
    }

    attachedObjects: [
        Page {
            id: settingsPage
            titleBar: TitleBar {
                title: "Nastavenia"
            }

            content: Container {
                Label {
                    text: "Ťuknutím na tlačidlo zmeníte tému"
                    horizontalAlignment: HorizontalAlignment.Center
                    margin.topOffset: 20
                }
                Button {
                    text: "Zmeň tému"
                    horizontalAlignment: HorizontalAlignment.Center

                    // Checks the current theme and then flips the value
                    onClicked: {
                        if (Application.themeSupport.theme.colorTheme.style == VisualStyle.Bright) {
                            Application.themeSupport.setVisualStyle(VisualStyle.Dark);
                        } else {
                            Application.themeSupport.setVisualStyle(VisualStyle.Bright);
                        }
                    }
                }
                Container {
                    layout: StackLayout {
                        orientation: LayoutOrientation.LeftToRight
                    }
                    Label {
                        text: "Časovač pre vypnutie rádia"
                        margin.topOffset: 8
                        horizontalAlignment: HorizontalAlignment.Center
                    }
                    ToggleButton {
                        id: togglebutton
                        horizontalAlignment: HorizontalAlignment.Center
                        onCheckedChanged: {
                            if (togglebutton.checked) {
                                picker.enabled = true;
                            } else {
                                picker.enabled = false;
                            }
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
