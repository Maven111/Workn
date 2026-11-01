**Why instant form switching matters**

People often land on the wrong form. A new visitor arrives at login. A returning user finds signup. Someone who fails to log in needs password reset. Switching forms is the moment where users decide whether to continue or leave, so any delay there loses signups.

When the forms are conditionally rendered on one page, switching is instant. Nothing reloads, the layout stays, and the user stays in context. This matters more on slow or unreliable connections, because a full page load there takes seconds. It also lets the app carry what the user has already typed, such as their email, into the next form so they don't retype it. The active form lives in a URL query parameter, so each state is still linkable and the back button works.

**What the user experience was before**

The agent had generated separate pages for signup, login and password reset. Each switch was a full page request: the browser asked the server for a new document, reloaded the whole layout, and often showed a blank flash first. Focus, scroll position and anything typed were lost. On a poor connection, a wrong turn cost several seconds, and the user had to start the form again. The server also handled a request for each switch, even though nothing about the user had changed.

**One case where separate pages are better**

A signup page that doubles as a landing page, for example one linked from an advert or search result. It needs its own URL, its own title, description and Open Graph tags, and content that search engines can read without running JavaScript. A single page that swaps forms on the client makes that harder, because it has one URL, one set of tags, and content that appears only after scripts run.

**The cost of the single-page approach**

Instant switching has a price. All three forms load up front, so the first load is heavier. Screen readers are not told a form changed unless the code moves focus and announces it. Analytics must record the switches by hand, since the browser never reports a page view. I accept these costs because the forms are small and switching is the most common action on this page.