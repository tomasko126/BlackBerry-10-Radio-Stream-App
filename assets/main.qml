import bb.cascades 1.4
import bb.multimedia 1.4

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
                id: webView
                url: "local:///assets/index.html"
                navigation.defaultHighlightEnabled: false
                settings.zoomToFitEnabled: true
                settings.webInspectorEnabled: true
                onMessageReceived: {
                    switch (message.data) {
                        case "expres":    player.setSourceUrl("http://85.248.7.162:8000/96.mp3")
                                          player.play()
                                          button.title = "Stop"
                                          button.imageSource = "asset:///images/icons/stop.png"
                                          break;
                        case "slovensko": player.setSourceUrl("http://live.slovakradio.sk:8000/Slovensko_128.mp3");
                                          player.play();
                                          button.title = "Stop";
                                          button.imageSource = "asset:///images/icons/stop.png";
                                          break;
                        case "funradio":  player.setSourceUrl("http://stream.funradio.sk:8000/fun128.mp3");
                                          player.play();
                                          button.title = "Stop";
                                          button.imageSource = "asset:///images/icons/stop.png";
                                          break;
                        case "europa2":   player.setSourceUrl("http://ice2.europa2.sk/fm-europa2sk-128");
                                          player.play();
                                          button.title = "Stop";
                                          button.imageSource = "asset:///images/icons/stop.png";
                                          break;
                        case "jemne":     player.setSourceUrl("http://93.184.69.143:8000/;jemnemelodie-high-mp3.mp3");
                                          player.play();
                                          button.title = "Stop";
                                          button.imageSource = "asset:///images/icons/stop.png";
                                          break;
                        case "stop":      player.reset();
                                          button.title = "Play";
                                          button.imageSource = "asset:///images/icons/play.png";
                                          break;
                    }
                    console.log(player.sourceUrl)
                }

                function getTime(h, m, s) {
                    var h = h * 3600000;
                    var m = m * 60000;
                    var s = s * 1000;
                    var time = h + m + s;
                    webView.postMessage(parseInt(time));
                }
            }
        }

        actions: [
            ActionItem {
                title: "CZ rádiá"
                ActionBar.placement: ActionBarPlacement.OnBar
                imageSource: "asset:///images/icons/info.png"
                onTriggered: {
                    webView.postMessage("scrollToCZ");
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
                        webView.postMessage("play");
                        player.setSourceUrl("http://85.248.7.162:8000/96.mp3");
                        player.play();
                        button.title = "Stop";
                        button.imageSource = "asset:///images/icons/stop.png";
                    } else {
                        webView.postMessage("stop");
                        player.reset();
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
                    webView.postMessage("scrollToSK");
                }
            }
        ]
    }

    attachedObjects: [
        MediaPlayer {
            id: player
            onError: {
                webView.postMessage("error");
            }
            onBufferStatusChanged: {
                if (bufferStatus === 1 || bufferStatus === 0) {
                    webView.postMessage("showLoading");
                } else {
                    webView.postMessage("hideLoading");
                }
            }
        },
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
                        webView.getTime(value.getHours(), value.getMinutes(), value.getSeconds());
                    }
                }
            }
        }
    ] // end of attachedObjects list
} // end of NavigationPane
