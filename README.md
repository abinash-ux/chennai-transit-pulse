# Chennai Transit Command

SMART CHENNAI AI PUBLIC TRANSPORT MANAGEMENT SYSTEM

FULL DASHBOARD FUNCTIONALITY + UI REDESIGN PROMPT

Upgrade the existing Smart Chennai AI Public Transport Management System.

Do not rebuild the project from scratch.
Keep the current system structure but fix all dashboards, implement missing logic, and upgrade the design.

All dashboards must become fully functional, not just UI placeholders.

Every button must execute real logic and update the system state across dashboards.

🎨 COMPLETE UI / THEME REDESIGN

The current design is too simple. Replace it with a massive premium smart-city dashboard design.

Design requirements:

• Dark smart mobility theme
• Deep blue + cyan gradient palette
• Glassmorphism dashboard panels
• Chennai skyline animated background
• Moving bus animation in landing page
• Interactive dark map with glowing bus markers
• Sidebar navigation with icons
• Animated counters
• Smooth hover animations
• Modern typography
• Enterprise dashboard layout

The system must look like a government smart transport control center.

👤 PASSENGER DASHBOARD (FINAL VERSION)

Ensure all passenger features work correctly.

Live Bus Tracking

• Interactive Chennai map
• Search bus number
• Search route
• Show moving buses
• Show occupancy %

Smart Trip Planner

Passenger enters:
• From stop
• To stop

System must show:

• Direct buses
• Connecting buses
• Travel time
• Fare calculation

Ticket Purchase (FIXED)

Enable ticket buying.

Steps:

Select From stop

Select To stop

System calculates fare

Wallet payment

Generate QR ticket

Save ticket to history

Update bus occupancy

Wallet System

• Add funds
• View transactions
• Deduct ticket payment

Monthly Pass

• Buy pass
• Show validity
• Allow conductor validation

Rerouting Request (MAIN FEATURE)

Passenger submits overcrowded bus request.

Form includes:

• Bus number
• Upload proof image
• Description

Status must update as:

Pending → Under Review → Approved → Rejected

If approved:

• Passenger gets notification
• Route updated

Complaint System

Passenger can report:

• Bus didn’t stop
• Rude conductor
• Rude driver
• Cleanliness issue

Fine Payment

If inspector issues fine:

• Fine appears in passenger dashboard
• Passenger can pay fine
• Inspector dashboard updates

🧑‍✈️ DRIVER DASHBOARD (MAKE FULLY WORKING)

Currently only overview works. Implement full features.

Route Module

Driver must see:

• Bus number
• Current route
• Next stops
• Passenger occupancy

Route Change Alert

When admin reroutes bus:

• Driver receives notification
• Shows old route vs new route

Driver SOS

Driver can send emergency alerts:

• Mechanical issue
• Accident
• Security issue

Admin receives alert.

Driver Request Module

Driver can request additional bus for overcrowded route.

Request goes to Admin AI routing panel.

Driver Analytics

Show:

• Trips completed
• Passenger load average
• Distance covered

🎫 CONDUCTOR DASHBOARD (MAKE FULLY WORKING)

Currently most modules do not work.

Ticket Issuing

Conductor must be able to:

• Select From stop
• Select To stop
• Calculate fare
• Record payment (cash/digital)
• Increase bus occupancy

QR Ticket Validation

Conductor scans QR ticket and validates it.

Monthly Pass Validation

Conductor verifies passenger pass.

Passenger Load Monitor

Display:

• Seats filled
• Standing passengers

Revenue Analytics

Charts showing:

• Cash revenue
• Digital revenue
• Pass usage

Overcrowding Alert

Conductor reports overcrowded bus to Admin AI system.

🕵️ INSPECTOR DASHBOARD (MAKE FULLY WORKING)

Currently most columns are not functional.

Passenger Ticket Check

Inspector can:

• Search passenger
• Validate ticket
• Validate pass

Issue Fine

Inspector must:

• Select passenger
• Choose violation
• Enter fine amount
• Set payment deadline

Fine appears in passenger dashboard.

Fine Analytics

Charts showing:

• Total fines issued
• Paid fines
• Pending fines
• Fine revenue

Inspector Reports

Inspector generates report and sends to Admin.

👨‍💼 ADMIN DASHBOARD (FULL CONTROL CENTER)

Ensure all modules work properly.

Fleet Monitoring

Replace static chart with real map.

Admin can:

• View all buses
• Search bus number
• See occupancy

AI Routing System (IMPORTANT)

Create three panels.

1️⃣ Underutilized buses (<30% occupancy)
2️⃣ Overcrowded buses (≥98% occupancy)
3️⃣ AI suggestions

AI suggestion logic:

If 3 buses on same route within 20–30 minutes are ≥98% full,
then show suggestion:

“Route requires additional bus.”

Admin Rerouting Action

Admin must:

Review overcrowded route

Check empty buses

Click Reassign Route

System must update:

• Driver dashboard
• Conductor dashboard
• Passenger live tracking
• Passenger notification

Revenue Analytics

Working charts for:

• Ticket revenue
• Pass revenue
• Fine revenue

Complaint Management

Admin sees passenger complaints and resolves them.

SOS Control Center

Admin sees emergency alerts from:

• Passenger
• Driver
• Conductor

Admin marks alerts resolved.

🔁 GLOBAL SYSTEM SYNCHRONIZATION

Every system action must update all dashboards.

Examples:

Ticket issued → Bus occupancy updated everywhere
Fine issued → Passenger + Inspector updated
Fine paid → Inspector analytics updated
Route changed → Driver + Conductor dashboards update

🎯 FINAL REQUIREMENT

After upgrade the system must:

• Have all dashboards fully functional
• Have working analytics
• Have synchronized system logic
• Have AI routing functionality
• Have premium smart-city design
• Look like a real Chennai transport authority platform

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da51f944-b932-45b7-9dee-232104879274).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
