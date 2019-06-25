REM delete extraneous rssitemcontent folders
REM Open /rss folder in sublime text. Search for "<link>https://www.comicsrss.com/"
REM Select all instances, and copy them into its own file
REM Delete "<link>https://www.comicsrss.com/" from the beginning of each line
REM Delete "/32-character-hex-code.html</link>" from the end of each line so you have a big list of folders to keep
REM ls -1 rssitemcontent > all-folders.txt
REM diff all-folders.txt and keep-folders.txt
REM make a delete-folders.txt file with all the lines starting with "-"
REM batch edit the lines to be rm -rf ./rssitemcontent/FOLDERNAME
echo "Not yet implemented"
