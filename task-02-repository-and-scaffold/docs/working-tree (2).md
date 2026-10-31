

**Q:  What breaks when a tree has one branch, and why that matters more after your first deployment than before it.**

**A: With one branch,** everything you do goes straight onto the line that counts as “the real project”. There is nowhere to keep unfinished work, nowhere to try an idea and bin it, and no checkpoint before a change becomes official.

**It matters more after deployment** because that line stops being private. Before deployment, `main` is only your notebook, so a mistake costs you some time. After deployment, `main` feeds what real users see, so a mistake is now a live problem, and some mistakes can’t be taken back quietly.

Essentially, feature branches keeps work in progress away from *main*. A pull request is the checkpoint before it joins. A branch I decide against can be deleted without ever having touched the main.   
