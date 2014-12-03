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