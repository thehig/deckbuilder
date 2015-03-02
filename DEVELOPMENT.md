# Development Document

Begining this project it is expected that you have a working knowledge of Javascript: HTML, CSS and some Node: npm, packages

My knowledge of Meteor primarily stems from:
* [Single Page Web Apps with Meteor](https://code.tutsplus.com/courses/single-page-web-apps-with-meteor)
* [Build a Multi-Player Card Game With Meteor](https://code.tutsplus.com/courses/build-a-multi-player-card-game-with-meteor)

## Meteor Boilerplate

#### Folder Structuring

Taken From [Structuring Your App](http://docs.meteor.com/#/full/structuringyourapp)

> By default, any JavaScript files in your Meteor folder are bundled and sent to the client and the server. However, the names of the files and directories inside your project can affect their load order, where they are loaded, and some other characteristics. Here is a list of file and directory names that are treated specially by Meteor:
>
> **client**
>
> Any directory named client is not loaded on the server. Similar to wrapping your code in if (Meteor.isClient) { ... }. All files loaded on the client are automatically concatenated and minified when in production mode. In development mode, JavaScript and CSS files are not minified, to make debugging easier. (CSS files are still combined into a single file for consistency between production and development, because changing the CSS file's URL affects how URLs in it are processed.)
> HTML files in a Meteor application are treated quite a bit differently from a server-side framework. Meteor scans all the HTML files in your directory for three top-level elements: &lt;head&gt;, &lt;body&gt;, and &lt;template&gt;. The head and body sections are separately concatenated into a single head and body, which are transmitted to the client on initial page load.
>
> **server**
>
> Any directory named server is not loaded on the client. Similar to wrapping your code in if (Meteor.isServer) { ... }, except the client never even receives the code. Any sensitive code that you don't want served to the client, such as code containing passwords or authentication mechanisms, should be kept in the server directory.
> Meteor gathers all your JavaScript files, excluding anything under the client, public, and private subdirectories, and loads them into a Node.js server instance. In Meteor, your server code runs in a single thread per request, not in the asynchronous callback style typical of Node. We find the linear execution model a better fit for the typical server code in a Meteor application.
>
> **public**
>
> All files inside a top-level directory called public are served as-is to the client. When referencing these assets, do not include public/ in the URL, write the URL as if they were all in the top level. For example, reference public/bg.png as &lt;img src='/bg.png' /&gt;. This is the best place for favicon.ico, robots.txt, and similar files.
>
> **private**
>
> All files inside a top-level directory called private are only accessible from server code and can be loaded via the Assets API. This can be used for private data files and any files that are in your project directory that you don't want to be accessible from the outside.
>
> **client/compatibility**
>
> This folder is for compatibility JavaScript libraries that rely on variables declared with var at the top level being exported as globals. Files in this directory are executed without being wrapped in a new variable scope. These files are executed before other client-side JavaScript files.
>
> **tests**
>
> Any directory named tests is not loaded anywhere. Use this for any local test code.
			

#### Meteor startup

Taken from [File Load Order](http://docs.meteor.com/#/full/fileloadorder)

> When not using special filenames and directories:
> 
> Files in subdirectories are loaded before files in parent directories, so that files in the deepest subdirectory are loaded first, and files in the root directory are loaded last. - Within a directory, files are loaded in alphabetical order by filename.
> Below is a complete list of special file and directory names that control file load order:
> 
> **lib**
> 
> After sorting as described above, all files under directories named lib are moved before everything else, preserving their order.
> 
> **main.***
> 
> All files that match main.* are moved after everything else, preserving their order.

## Specific Meteor Configurations

### Meteor Libraries

* meteor-platform
* iron:router					- Single-page application router
* accounts-ui					- Minimalist login templates
* accounts-password				- Basic password authentication module
* npm-container					- Wrapper to support npm packages inside Meteor
* http							- Required for making calls to 3rd party websites
* mrt:moment					- Used for nice timestamps like "a moment ago"
* mizzao:bootstrap-3			- Bootstrap plugin
* mizzao:user-status			- Adds user status like idle, away
* accounts-meteor-developer		- Sign in with Meteor, Facebook
* mvrx:bluebird					- Promise management

### Meteor Npm Packages

Configured by the [packages](packages.json) file, loads npm packages into Meteor by using the npm-container package

* cheerio 	- Used for server-side HTML interpertation. Acts like JQuery, but without a DOM.
* ~~future 	- Used for promise management. Depricated in favor of bluebird~~

### Meteor Security

For basic Meteor security the following default packages are removed

* autopublish					- Makes any database collections visible to clients
* insecure						- Allows clients to edit the database directly

Further reading can be found [here](https://www.discovermeteor.com/blog/meteor-and-security/)

## Code Editor

I have gotten most of my setup from [tutsplus](https://code.tutsplus.com/courses/perfect-workflow-in-sublime-text-2) and [Meteorpedia](http://www.meteorpedia.com/read/Sublime_Text)

I use [Sublime Text 3]() with the following plugins:

* [BetterJavascript](https://github.com/int3h/sublime-better-javascript)
* [CSSComb](https://github.com/csscomb/sublime-csscomb)
* [Emmet](http://emmet.io/)
* [Bracketeer](https://github.com/colinta/SublimeBracketeer)
* [BracketHilighter](https://github.com/facelessuser/BracketHighlighter)
* [DocBlockr](https://github.com/spadgos/sublime-jsdocs)
* [Gists](https://github.com/condemil/Gist)
* [Meteor Snippets](https://github.com/mrtnbroder/meteor-snippets)
* [SublimeLinter](http://www.sublimelinter.com/en/latest/)
* [SublimeLinter-jshint](https://packagecontrol.io/packages/SublimeLinter-jshint)
* [TernJS](http://emmet.io/blog/sublime-tern/)

## Vagrant Environment

Meteor doesn't work so well under Windows (at the time of writing), so I have written this guide to getting Meteor running in a vagrant shell (based on [this](https://gist.github.com/gabrielhpugliese/5855677))

Vagrant Setup:

    vagrant init ubuntu/trusty64

Add this to your Vagrant file (Note Memory and cpu specification. Remove if required, but Meteor uses a lot of memory for socket connections)

    config.vm.synced_folder './shared', '/home/vagrant/shared'

    config.vm.network :forwarded_port, guest: 3000, host: 3000

    config.vm.provider "virtualbox" do |v|
        v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
        v.memory = 2048
        # v.cpus = 2
    end

Then run

    vagrant up

Once the VM boots run

    vagrant ssh

Or use your favourite SSH client (I prefer [putty tray](https://puttytray.goeswhere.com/))

Install the required dependencies

    sudo apt-get install npm git

Install meteor

    curl https://install.meteor.com | /bin/sh

Meteor causes issues with access permissions. After checking out, move your .meteor and packages folders to a mock folder.

Check out this project with the VM

    git clone https://github.com/thehig/deckbuilder.git deckbuilder

Create mock folder

    mkdir -p ~/mock/deckbuilder

Move your folders to the mock directory

    mv /home/vagrant/shared/deckbuilder/.meteor /home/vagrant/mock/deckbuilder/
    mv /home/vagrant/shared/deckbuilder/packages /home/vagrant/mock/deckbuilder/

Create mounting points for the folder

    mkdir /home/vagrant/shared/deckbuilder/.meteor
    mkdir /home/vagrant/shared/deckbuilder/packages

Then mount the directories

    sudo mount --bind /home/vagrant/mock/deckbuilder/.meteor /home/vagrant/shared/deckbuilder/.meteor
    sudo mount --bind /home/vagrant/mock/deckbuilder/packages /home/vagrant/shared/deckbuilder/packages

And finally, add these mounts to the end of your ~/.bashrc file to make the directories auto-mount on login