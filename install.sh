cd /root
git clone git@github.com:ArtskydJ/comicsrss.com.git || true
apt-get install sendmail -y
read -p "Enter your email address: " comicsrss_email_address
crontab -l > ./crontab.txt
echo "MAILTO=$comicsrss_email_address" >> ./crontab.txt
echo "# Runs hourly at 1:15, 2:15, 3:15, etc." >> ./crontab.txt
echo "15 * * * * sh /root/comicsrss.com/_generator/generate-and-push.sh" >> ./crontab.txt
crontab ./crontab.txt
