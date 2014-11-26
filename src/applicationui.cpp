// Tabbed pane project template
#include "applicationui.hpp"

#include <bb/cascades/Application>
#include <bb/cascades/QmlDocument>
#include <bb/cascades/AbstractPane>
#include <bb/system/SystemToast>
#include <bb/system/SystemUiPosition>
#include <QObject>

using namespace bb::cascades;
using namespace bb::system;

void ApplicationUI::ApplicationUI::showToast(QString message) {
    SystemToast *toast = new SystemToast(this);
    toast->setBody(message);
    // optional position MiddleCenter = 0, TopCenter = 1, BottomCenter = 2
    // toast->setPosition(bb::system::SystemUiPosition::Type(2));
    toast->show();
}

ApplicationUI::ApplicationUI(bb::cascades::Application *app)
: QObject(app)
{
    // create scene document from main.qml asset
    // set parent to created document to ensure it exists for the whole application lifetime
    QmlDocument *qml = QmlDocument::create("asset:///main.qml").parent(this);
    qml->setContextProperty("app", this);

    // create root object for the UI
    AbstractPane *root = qml->createRootObject<AbstractPane>();

    // set created root object as a scene
    app->setScene(root);

}
