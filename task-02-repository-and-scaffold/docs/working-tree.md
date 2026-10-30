**With one branch,** a work-in-progress and a working code share a single line of history, so these things could go wrong:

1. **Unfinished work mixes with working code.** Every commit lands on `main`, so half-built features sit next to the version that runs. There’s no place to put work that isn’t ready.  
2. **You can’t try something and throw it away.** With no spare branch, abandoning an idea means undoing commits on the main line, and rewriting history there is risky.  
3. **You can’t work on two things at once.** A quick bug fix has to wait behind, or get tangled with, whatever you’re halfway through.  
4. **Nothing checks code before it lands.** With no branch there’s no pull request, so no moment where anyone (including you) reviews a change before it joins *main*.  
5. **Rollback is blunt.** When something breaks, you can’t tell which commit did it, and reverting takes unrelated good work with it.

**Why it matters more after the first deployment.** Before deploying, *main* is a private notebook, and breaking it costs only you. After deployment, *main*  is connected to what real users see, so:

1. **A bad commit becomes a live bug.** If production deploys from *main* (many hosts redeploy on every push), a half-finished change can reach users within minutes.  
2. **You can’t fix a live bug safely.** To patch production you must ship the fix, but on one branch it comes bundled with whatever unfinished work sits on top of it.

