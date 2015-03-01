# Development Document

## Recommended reading

My knowledge of Meteor primarily stems from:
* [Single Page Web Apps with Meteor](https://code.tutsplus.com/courses/single-page-web-apps-with-meteor)
* [Build a Multi-Player Card Game With Meteor](https://code.tutsplus.com/courses/build-a-multi-player-card-game-with-meteor)

### Meteor Startup Process

Read from [Structuring Your App](http://docs.meteor.com/#/full/structuringyourapp) paying special attention to the default application structure for meteor apps, and how that affects startup specifically:
* client
* server
* public
* lib
* main

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

### Meteor npm

Configured by the [packages](packages.json) file, loads npm packages into Meteor by using the npm-container package

* cheerio 	- Used for server-side HTML interpertation. Acts like JQuery, but without a DOM.
* future 	- Used for promise management. Depricated in favor of bluebird

### Meteor Security

For basic Meteor security the following default packages are removed

* autopublish					- Makes any database collections visible to clients
* insecure						- Allows clients to edit the database directly

Further reading can be found [here](https://www.discovermeteor.com/blog/meteor-and-security/)

## Vagrant

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

Or use your favourite SSH client (I prefer putty tray)

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