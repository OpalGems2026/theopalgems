# Opal Gems — Handover Guide

This is what I'd tell you if we had an afternoon together before I left.

It's not a manual. The manual exists, it's long, and you should only open it when
something here points you at it. This is the short version: what you need to get into,
what you'll actually find yourself doing, and the handful of things that will bite you if
nobody warns you first.

You don't need to be technical. A few things in here do need a developer, and I've said
so plainly where that's the case.

## Start here: get the keys before I'm gone

Everything else in this guide is recoverable. Access isn't, or at least not without a
tedious week of support tickets and proving who you are. So do this part first, while
there's still someone to ask.

There are seven, not the six people usually count. Each one below has the direct link,
and a blank for the login. **Write the passwords on the separate Credential Sheet, never
in this document** — this file lives in the public code repository, so anything typed here
is readable by anyone who goes looking.

**Netlify** hosts the site. Where you go to see whether a change published, or to undo
one.
→ https://app.netlify.com/teams/opalgems2026/projects
Login: ............................................................

**Supabase** is the database: subscribers, warranty records, and some of the site's
content.
→ https://supabase.com/dashboard/project/avbegqyvtvdmdilgwnif
Login: ............................................................

**Resend** sends every email the site sends. The sending domain is already verified, so
leave those DNS records alone.
→ https://resend.com/emails (delivery log)
→ https://resend.com/domains/c7e4f730-054f-45dc-b5b1-54666ec28e7c (domain setup)
Login: ............................................................

**GitHub** holds the code.
→ https://github.com/OpalGems2026/theopalgems
Login: ............................................................

**GoDaddy** is the registrar. It owns `theopalgems.com` and runs the DNS.
→ https://dcc.godaddy.com/domains
Login: ............................................................

**Microsoft 365** is the business mailbox, bought through GoDaddy. This is the one people
forget, and it's the one that hurts most to lose. It's where `hello@theopalgems.com` and
`sales@theopalgems.com` actually *receive* mail. Resend only sends; incoming mail lands
here, filtered through Proofpoint on the way in.
→ https://admin.microsoft.com (administration)
→ https://outlook.office.com (the mailbox itself)
Login: ............................................................

**The admin panel** is part of the website rather than a separate company, so there's no
billing and no separate account. Just the shared password.
→ https://theopalgems.com/admin
Password: on the Credential Sheet

Tick these off properly. Don't take my word that they're done:

- [ ] I've logged into all seven myself, from my own machine
- [ ] They're saved in a password manager I control, not in a note on someone's phone
- [ ] Two-factor is on **my** phone
- [ ] Recovery codes are saved somewhere I'll still have in a year
- [ ] The **billing** email is mine on Netlify, Supabase, Resend and GoDaddy
- [ ] I can send *and* receive as `hello@theopalgems.com`
- [ ] The domain is set to auto-renew, on a card that won't expire
- [ ] I know who to call for development work

That billing line is the one people skip. On most of these services the billing address
is a completely separate field from the login address, tucked away under team settings.
Change the login and forget the billing, and the invoices keep landing in the inbox of
whoever set the account up. You find out when the card expires and something stops
renewing.

## What you'll actually do

Nearly all of it happens in the admin panel. Go to `theopalgems.com/admin`, enter the
password, and you're in for 24 hours.

One thing to know about that password: it's a single shared one. There aren't individual
staff accounts. That means two things. There's no record of who changed what, and if you
ever need to cut one person's access you have to change it for everybody at once. I never
built anything better because it was never quite urgent enough. If the team grows, fix it.

### Reading the subscriber list

**Admin → Subscribers.** Names, emails, phone numbers, and a status against each one.

The status is the important column, and it's where nearly every support question comes
from. **Confirmed** means they clicked the link in their email and they'll get
newsletters. **Unsubscribed** means they opted out, so leave them be. **Pending** means
they signed up but never clicked the link, and they get nothing at all.

Pending is not a bug. It's how double opt-in works, it's deliberate, and it's why the
list is worth having. But it does mean that when someone tells you "I signed up and never
heard anything," the answer is almost always that they're sitting in Pending and the
confirmation email is in their spam folder. Check there before you go looking for a real
fault. Alexandra asked me this exact question in August and that was the answer.

Export CSV gives you the whole list in Excel. Bear in mind what that file actually is:
real customers' names, emails and phone numbers. Don't forward it around, and delete the
old copies off your desktop.

### Sending the newsletter

The newsletter never sends itself. That was a deliberate choice and I'd keep it.

Every other Monday something builds a **draft** and emails it to you. Pieces are already
picked to suit the season. You open **Admin → Newsletter**, swap out anything you don't
like, fix the wording, and then — always — click **Send test to yourself** and look at it
in your own inbox on your phone. Email rendering is its own special hell and things that
look fine in the preview don't always survive Outlook.

When you're happy, hit Send. It goes to Confirmed subscribers only.

There's no undo. Once it's gone it's gone, so the test send isn't optional.

### The smaller jobs

**Warranty registrations** land in **Admin → Warranties**, and the customer detail also
copies itself across to the inventory system automatically.

**Boutique addresses, phones and opening hours** are in **Admin → Locations**. Edit, save,
and it's live within a minute or two.

**The 10% welcome code** is `SPARKLE10`. You can change it without a developer, which
surprises people: it's a setting in Netlify, under Site configuration → Environment
variables. Edit `PROMO_CODE`, then trigger a redeploy from the Deploys tab. That's it.

**Products are the exception.** They're not in the admin panel at all. Product listings
live in the site's code, so adding a necklace or correcting a price is a developer job
and a deploy. This is the biggest rough edge in the whole setup and I know it. It was on
my list. If you're going to invest in one improvement, make it this one, because right now
every stock change costs you a developer's afternoon.

## Things that run without you

Worth knowing so you don't think something's broken when it's just working.

Someone signs up, and they immediately get a confirmation email with the 10% code in it,
while you get an alert. When they click confirm, they get a welcome email and flip to
Confirmed. A day later they get one short survey, once, and never again. Every other
Monday you get the newsletter draft. And any time a developer merges a change, the site
rebuilds and publishes itself within a few minutes without anyone pressing anything.

That "once, and never again" on the survey is load-bearing, and it wasn't always true.
For a while the job that sends it never marked anyone as having received it, so every six
hours, around the clock, it cheerfully sent the same survey to every single person who
hadn't replied. It went on for days before anyone noticed. It's fixed, and it's been well
behaved since, but if you ever hear "I keep getting the same email from you," that's the
first place I'd look.

## When something looks wrong

Work down this before you call anyone. Most of it you can solve yourself.

**If the site is down or showing something out of date**, open Netlify and look at
Deploys. Either the most recent one succeeded or it says Failed. If it failed, click into
it, copy the error, and send that to your developer, because that message is 90% of the
diagnosis. If you need the site right this minute, find the last deploy marked Published
and click **Publish deploy** on it. That instantly puts the old version back. It's the
single most useful button in Netlify and almost nobody knows it's there.

**If someone didn't get an email**, check Subscribers for their status first. Nine times
out of ten they're Pending. If genuinely nobody is receiving anything, open Resend and
look for failures there.

**If warranty registrations stop appearing**, get a developer to check that the database
key is set in Netlify. This one is nasty: when that key is missing the registration
doesn't error, doesn't warn anybody, and returns a perfectly happy success message while
quietly writing nothing anywhere. Everything looks fine from the outside. If registrations
have just stopped for no visible reason, that's your first suspect.

**If the promo popup won't show up when you're testing**, that's by design. It appears
once per visitor and then remembers. Open the site in a private window.

## Where the bodies are buried

Things that cost me time, so they don't have to cost you any.

**There are two Netlify sites both called `theopalgems`.** One is live. The other is an
old one sitting under a personal account, still wired to the previous code repository,
last published in August. It does nothing and harms nothing, but if you go looking in
Netlify and end up staring at a site whose most recent deploy is months old, wondering why
your change isn't there, that's why. Check which account you're in. Honestly, the right
move is to delete the old one, I just never got round to it.

**Supabase keys come in two flavours and one of them silently doesn't work.** The newer
`sb_secret_…` style keys get rejected by parts of this setup. You want the older ones that
start with `eyJ`, found under the "Legacy" tab on the API keys page. There's no helpful
error when you get this wrong. It just fails and you assume you've mistyped something.

**Broken product photos all look identical.** When an image is missing, the site quietly
falls back to a stand-in, and the stand-in is a circular pendant. So if you're ever
looking at a page of rings that are inexplicably all the same pendant, nothing is
mysteriously broken in the design. Those images just aren't where the code thinks they
are.

**The stock spreadsheets are messier than they look.** Prices are written inconsistently,
some in European style where `$1.750,00` means one thousand seven hundred and fifty, and
the image column is full of Google Drive links that often say "done" or "SOLD" instead of
an actual link. Anyone re-importing that data needs to be told this, or they'll produce
some very strange prices.

**"Register Customer" in the footer isn't part of this website.** It points at a separate
application the sales team uses to log purchases. Customers can't and shouldn't use it.
This confused Alexandra, and it'll confuse the next person too, because it sits in the
footer looking like every other link.

**Supabase is on the free plan.** Fine for now. Two things to keep half an eye on: free
projects go to sleep after long periods of no activity, which won't happen while the site
has real traffic but would during a very quiet spell, and there are size limits you'll
eventually bump into as the list grows. Neither is urgent. Both are worth knowing before
they're urgent.

## Don't do these

Short list, but I mean all of it.

Never paste a password or a key into an email, a chat, or a support ticket. If you do,
treat it as burned and change it the same day rather than hoping. Never put one into the
code repository either — that repository is public, and anything committed to it is
visible to anyone who looks, permanently, even if you delete it afterwards.

Don't send the subscriber CSV outside the business. It's real personal data about real
customers.

Don't start texting marketing messages to the phone numbers we collect without checking
the rules first. Email and SMS are governed very differently and the SMS side has real
teeth. Collecting the numbers is fine. Texting offers to them is a conversation to have
with someone who knows the regulations.

Don't delete a Supabase project or a Netlify site to tidy up. Deletion isn't reversible
and the "obviously unused" one occasionally isn't. Ask.

And don't let the domain lapse. Everything else here can be rebuilt. The name can be
bought by somebody else while you're not looking.

## The rhythm of it

Every other Monday the newsletter draft arrives and wants half an hour. Weekly, glance at
the subscriber count and see if it's moving. Monthly, export the list as a backup and skim
the warranty registrations. Quarterly is when the boutique stock and photography start
looking stale, and it's a good moment to check the billing on all three services. Yearly,
renew the domain.

That's genuinely it. It's a low-maintenance setup most of the time, punctuated by the
newsletter.

## If you need help

Before you contact anyone, have these ready, because you'll be asked for all four: what
you were doing, what you expected, what actually happened, and a screenshot with the error
text visible. Also say whether it's affecting the live site or only the admin panel, since
that changes how urgently anyone needs to move.

The **Operations Manual** is the long version. Every system, every setting, the database,
the security, step-by-step troubleshooting. Hand it to any developer you bring in. It'll
save them a day of poking around, and it means you're not paying someone to rediscover
things that are already written down.

## The numbers, in one place

| | |
|---|---|
| Website | https://theopalgems.com |
| Main phone | (920) 920-1145 |
| WhatsApp | +1 561-251-9560 |
| Email comes from | hello@theopalgems.com |
| Promo code | SPARKLE10 |
| Boutiques | Opal Grand, Opal Sol, Jupiter Beach, Olde Naples |

### The pages you'll open most

Bookmark these. They save digging through menus every time.

| Where | Link |
|---|---|
| Subscribers | https://theopalgems.com/admin/subscribers |
| Newsletter | https://theopalgems.com/admin/newsletter |
| Warranties | https://theopalgems.com/admin/warranties |
| Boutique details | https://theopalgems.com/admin/locations |
| Deploys (publish / roll back) | https://app.netlify.com/teams/opalgems2026/projects |
| Email delivery log | https://resend.com/emails |
| Database tables | https://supabase.com/dashboard/project/avbegqyvtvdmdilgwnif/editor |
| Supabase usage & billing | https://supabase.com/dashboard/project/avbegqyvtvdmdilgwnif/settings/billing |
| Domain & DNS | https://dcc.godaddy.com/domains |
| Business mailbox | https://outlook.office.com |

### Things worth fixing when you have a moment

Not urgent, but a developer should know about them.

The DNS has DMARC set to `p=none`, which means it watches for people spoofing your
address but doesn't stop them. Tightening it is a small job and worth doing before the
list gets large.

The admin panel still uses one shared password with no individual accounts.

And products still live in code rather than the admin panel, which is the change that
would save you the most money over time.
