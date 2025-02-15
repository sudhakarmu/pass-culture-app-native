## Installation - iOS

After setting up your [environment][1], you can follow the steps below to run the **pass Culture** mobile application on iOS.

### Further installation process

To install iOS modules (pods), we use Cocoapods (dependency manager). It is built with Ruby, so make sure it is installed on your computer.

We use [bundler][2] to install our Ruby gems. You can install it with `gem install bundler`.

Now you can install Cocoapods with `bundle install`. This will install the gems.

To install the pods, and create the Pods folder, run:

- `bundle exec pod install` inside the folder `ios`
- you may be asked to run `bundle exec pod repo update`

### 🔥 Firebase setup

You will need to add the `GoogleService-Info.plist` file in the `ios` directory. You can get a copy of the testing configuration one through the password manager, or directly through the Firebase console inside `Project Settings`.

### Setup Xcode to launch the app in the Simulator or on your external device

In order to launch the app in your Apple device, you need to follow these steps:

Download the iOS certificates to your computer:

1. Create an Apple Developer passCulture account (https://developer.apple.com/).
2. Connect to the Apple Developer account with Xcode.
3. Get invited to the Apple Developer group by an Admin.
4. Download the private key via fastlane:
   `bundle exec fastlane ios download_certificates --env testing`
5. When required, use the git ssh URL of the private certificates repository `pass-culture-app-native-certificates`.
6. Get the `match repo passphrase` on 1password in the "Tech" vault.

(Only the first time) Set arbitrary Version and BuildVersion numbers of the App in Xcode at PassCulture > General > Identity > Build

For example :

- Version : 1.176.0
- Build : 10176000

### 🚀 Run the app with yarn

- For Apple External Device

Connect your device to the computer and run `yarn ios:testing --device` or use the Xcode interface. Choose a scheme (your device) and click the Run button in the toolbar. More info [here][3].

- For Xcode Simulator

Run `yarn ios:testing` or use the Xcode interface. More info [here][3].
This will also start the metro server. If not, run `yarn start` in another tab.

### 😤 Troubleshooting

<br />
<details>
  <summary>env: node: No such file or directory

Command PhaseScriptExecution failed with a nonzero exit code</summary>

If this error pops up while trying to build with Xcode it means that Xcode can’t find Node because the sym-link to Node is not made.

#### First option

  Run `ln -s "\$(which node)" /usr/local/bin/node`

  If it says “File exists”, `rm /usr/local/bin/node` and rerun the command above.

  Drawback ❌: This sym-link will be obsolete as soon as the path of your node instance changes. To prevent this, you can command above to your .bashrc. Thus, the command will be run each time you open a new terminal

#### Second option

  Add node with brew : `brew install node`

  Drawback ❌: If you were using a node version manager (nvm, fnm, ...) you will now have two different node instances

</details>
<br />
<details>
  <summary>❌ error: An organization slug is required (provide with --org)</summary>

This error means that the ~/.sentryclirc file has not been added correctly. Please run through [this tutorial again](https://github.com/pass-culture/pass-culture-app-native/blob/master/doc/standards/sentry.md#-configure-sentry-cli)

</details>
<br />
<details>
  <summary>sentry reported an error: Invalid Token (http status: 401)</summary>
  
This error means that the sentry token you generated is invalid. Please run through [this tutorial again](https://github.com/pass-culture/pass-culture-app-native/blob/master/doc/standards/sentry.md#-configure-sentry-cli) and be careful with the scope permissions 😉

</details>
<br />
<details>
  <summary>The application's Info.plist does not contain a valid CFBundleVersion</summary>

Make sure you installed jq so the CFBundleVersion can be automatically filled.

</details>

[1]: ./setup.md
[2]: https://bundler.io/bundle_install.html
[3]: https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator-or-on-a-device
