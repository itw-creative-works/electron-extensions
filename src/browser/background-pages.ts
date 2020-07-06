import { app, webContents } from 'electron';
import { parse } from 'url';
import { EventEmitter } from 'events';
import { PROTOCOL_SCHEME } from '../constants';
import { isBackgroundPage } from '../utils/web-contents';

export const sendToExtensionPages = (channel: string, ...args: any[]) => {
  webContents.getAllWebContents().forEach((wc) => {
    if (wc.isDestroyed() || !wc.getURL().startsWith(PROTOCOL_SCHEME)) return;
    wc.send(channel, ...args);
  });
};

export declare interface BackgroundPages {
  on(
    event: 'created',
    listener: (webContents: Electron.WebContents) => void,
  ): this;
  on(event: string, listener: Function): this;
}

export class BackgroundPages extends EventEmitter {
  public constructor() {
    super();

    app.on('web-contents-created', (e, wc) => {
      if (isBackgroundPage(wc)) {
        this.emit('created', webContents);
      }
    });
  }

  public get(extensionId: string, session: Electron.Session) {
    return webContents
      .getAllWebContents()
      .find(
        (x) =>
          isBackgroundPage(x) &&
          parse(x.getURL()).hostname === extensionId &&
          x.session === session,
      );
  }
}
