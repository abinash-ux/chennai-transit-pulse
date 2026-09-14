# Chennai Transit Pulse

## AI-Assisted Smart Bus Operations and Safety Management Framework

Chennai Transit Pulse is a web-based AI-assisted public transportation
management and safety platform designed to support intelligent bus operations,
passenger services, fleet utilization, complaint management, ticket
management, emergency response, and administrative decision-making.

The platform integrates multiple transportation stakeholders into a unified
role-based system:

- Passengers
- Drivers
- Conductors
- Inspectors
- Administrators
- Control-room personnel

Instead of treating ticketing, passenger services, fleet monitoring, complaints,
bus allocation, and emergency response as independent systems, Chennai Transit
Pulse connects these operational functions through a centralized platform.

The project was developed as a functional research prototype to demonstrate
AI-assisted decision support for smart public transportation operations.

---

# 1. Project Overview

Urban public transportation systems face several operational challenges,
including:

- Bus overcrowding
- Underutilization of available buses
- Uneven passenger demand
- Manual fleet-management decisions
- Passenger complaints
- Ticket-management difficulties
- Emergency-response coordination
- Limited communication between transportation stakeholders

Chennai Transit Pulse addresses these challenges through a centralized
smart transportation management framework.

The platform combines passenger-facing services with operational dashboards
and an AI-assisted decision-support layer.

The overall system follows the workflow:


Passenger & Operational Data
            |
            v
    Centralized Database
            |
            v
 Operational Monitoring
            |
            v
 AI-Assisted Analysis
            |
            v
 Recommendations / Alerts
            |
            v
 Administrator Review
            |
            v
 Operational Action
            |
            v
 Updated Transportation State
2. Main Objectives

The system is designed to:

Provide centralized public transportation management.
Improve passenger access to bus and route information.
Support digital ticketing and ticket verification.
Monitor passenger occupancy.
Identify overcrowded and underutilized buses.
Support adaptive bus reallocation.
Assist administrators with AI-generated recommendations.
Digitize complaint management.
Provide coordinated emergency/SOS management.
Connect passengers and transportation personnel through
role-specific dashboards.
Maintain synchronized operational information across the platform.
3. System Architecture

The platform uses a role-based architecture connected through a centralized
backend.

                         CHENNAI TRANSIT PULSE
                                  |
        -----------------------------------------------------
        |          |          |          |         |         |
        v          v          v          v         v         v
   Passenger    Driver   Conductor   Inspector   Admin   Control Room
        |          |          |          |         |         |
        -----------------------------------------------------
                                  |
                                  v
                         Centralized Backend
                                  |
                    ----------------------------
                    |                          |
                    v                          v
               PostgreSQL              Authentication
                                  |
                                  v
                     AI-Assisted Decision Support
                                  |
             ------------------------------------------
             |                    |                   |
             v                    v                   v
       Occupancy Analysis   Complaints          Emergency
             |
             v
      Bus Reallocation
       Recommendations
4. Role-Based Dashboards

The system provides separate interfaces for each major transportation
stakeholder.

4.1 Passenger Dashboard

The Passenger Dashboard is the primary passenger-facing interface.

Live Bus Tracking

Passengers can:

Search buses by bus number.
Search buses by route.
View available buses.
Monitor bus occupancy.
View bus movement information.
Access transportation information through an interactive map.
Smart Trip Planner

Passengers can enter:

Starting stop
Destination stop

The system can provide:

Direct bus options
Connecting bus options
Estimated travel information
Fare information
Digital Ticketing

Passengers can:

Select the origin stop.
Select the destination stop.
Calculate the applicable fare.
Pay using the available wallet/payment mechanism.
Generate a digital QR ticket.
Store purchased tickets in ticket history.

Ticket information is stored in the centralized system so that it can
subsequently be checked by transportation personnel.

Wallet

The passenger wallet provides:

Wallet balance
Add-funds functionality
Transaction history
Ticket-payment deductions
Monthly Pass

Passengers can:

Purchase a monthly pass.
View pass validity.
Present the pass for conductor verification.
Complaints

Passengers can submit transportation-related complaints such as:

Bus did not stop
Rude conductor
Rude driver
Cleanliness problems
Other transportation-related issues

Complaint information is transferred to the administrative workflow for
review and resolution.

Rerouting Request

Passengers can submit a request when they experience overcrowding or
transportation problems.

The request can include:

Bus number
Description
Supporting image/proof

The request follows a controlled status workflow:

Pending
   |
   v
Under Review
   |
   +--------+
   |        |
 Approved  Rejected
   |
   v
Passenger Notification
Fine Management

When an inspector issues a transportation fine:

The fine becomes visible to the passenger.
Fine information can be reviewed.
Payment can be recorded through the passenger system.
The updated payment state can be reflected in the relevant administrative
records.
Passenger SOS

Passengers can submit emergency alerts.

Emergency information is forwarded to the administrative/control-room
interface for response and resolution.

5. Driver Dashboard

The Driver Dashboard provides operational information required by drivers.

Route Information

Drivers can view:

Assigned bus
Bus number
Current route
Next stops
Current passenger occupancy
Operational information
Route Change Notifications

When an administrator approves a bus-route reassignment, the driver can
receive the corresponding operational notification.

The system can display:

Previous Route
      |
      v
Approved Route Change
      |
      v
New Route
Driver SOS

Drivers can report emergencies such as:

Mechanical problems
Accidents
Security issues
Other operational emergencies

The alert is transmitted to the administrative/control-room workflow.

Additional Bus Request

Drivers can request additional transportation capacity when a route is
experiencing excessive passenger demand.

The request can be considered by the administrative AI-assisted routing
workflow.

Driver Analytics

The dashboard provides operational information such as:

Trips completed
Average passenger load
Distance covered
Other available operational indicators
6. Conductor Dashboard

The Conductor Dashboard supports onboard passenger and ticket operations.

Ticket Issuing

Conductors can:

Select the origin stop.
Select the destination stop.
Calculate the fare.
Record the payment method.
Issue the ticket.
Update passenger-load information.

Payment types can include:

Cash
Digital payment
QR Ticket Validation

Conductors can validate passenger QR tickets and verify their ticket
information.

Monthly Pass Validation

Conductors can verify the validity of passenger monthly passes.

Passenger Load Monitoring

The conductor interface provides passenger-load information including:

Seats occupied
Standing passengers
Overall occupancy
Available capacity
Revenue Analytics

The dashboard can provide revenue information such as:

Cash revenue
Digital revenue
Pass usage
Overcrowding Reporting

Conductors can report overcrowding conditions to the administrative
decision-support system.

This information can contribute to the identification of routes requiring
additional transportation capacity.

Emergency Reporting

Conductors can also submit emergency alerts to the control-room/admin
workflow.

7. Inspector Dashboard

The Inspector Dashboard supports transportation compliance and ticket
inspection.

Passenger Ticket Validation

Inspectors can:

Search passenger records.
Check digital tickets.
Verify ticket validity.
Verify monthly passes.
Fine Management

Inspectors can issue fines by recording:

Passenger
Violation type
Fine amount
Payment deadline
Fine status

The fine information becomes available through the passenger and administrative
systems.

Fine Analytics

The dashboard provides information such as:

Total fines issued
Paid fines
Pending fines
Fine revenue
Inspector Reports

Inspectors can generate operational inspection information and submit reports
to the administrative system.

8. Administrator Dashboard

The Administrator Dashboard acts as the central operational control center.

It provides access to:

Fleet monitoring
AI-assisted routing
Bus occupancy analysis
Revenue analytics
Complaint management
Emergency/SOS management
Operational monitoring
Transportation decision support
9. Fleet Monitoring

The administrator can monitor the transportation fleet through the
administrative interface.

The system provides information about:

Bus numbers
Routes
Current occupancy
Bus availability
Operational status

The fleet-monitoring interface is designed to support centralized monitoring
of transportation operations.

10. AI-Assisted Decision Support

The AI-assisted decision-support layer is one of the central components of
Chennai Transit Pulse.

The system analyzes operational information such as:

Passenger demand
Bus occupancy
Available capacity
Route information
Complaint information
Bus availability

The purpose of the AI layer is to assist transportation administrators rather
than independently control the transportation network.

Operational Data
       |
       v
AI-Assisted Analysis
       |
       v
Recommendation
       |
       v
Administrator Review
       |
   +---+---+
   |       |
Approve   Reject
   |
   v
Operational Action

The administrator remains responsible for the final operational decision.

11. Overcrowded Bus Detection

The system monitors passenger occupancy to identify buses experiencing
high passenger loads.

An operational overcrowding threshold can be configured according to the
transportation scenario.

The prototype uses the following decision-support rule:

Occupancy >= 98%
        |
        v
Overcrowded Bus

The system identifies buses meeting the configured overcrowding condition
and provides this information to the administrative decision-support
interface.

12. Underutilized Bus Detection

Buses with low passenger occupancy can be identified as underutilized.

The prototype uses:

Occupancy < 30%
        |
        v
Underutilized Bus

These buses can be considered as potential resources for adaptive
reallocation when another route experiences excessive passenger demand.

13. AI-Assisted Dynamic Bus Reallocation

Dynamic Bus Reallocation is designed to improve the utilization of available
bus capacity.

The system considers operational information including:

Current occupancy
Passenger demand
Route information
Bus availability
Complaint information
Operational conditions

The AI-assisted system identifies:

Overcrowded Route
       +
Available / Underutilized Bus
       |
       v
AI Recommendation
       |
       v
Administrator Review
       |
       v
Reassign Bus

For the prototype decision-support scenario, when multiple buses operating on
the same route within a defined time window reach the overcrowding threshold,
the system can generate an operational recommendation such as:

Route requires additional bus.

The administrator can review the recommendation and approve or reject the
proposed reassignment.

14. Route Reassignment Workflow

When an administrator approves a reassignment:

Overcrowded Route
       |
       v
Identify Available Bus
       |
       v
AI Recommendation
       |
       v
Administrator Approval
       |
       v
Route Reassignment
       |
       +------------------+
       |                  |
       v                  v
Driver Dashboard    Conductor Dashboard
       |
       v
Passenger Information

The updated operational state is reflected in the relevant dashboards.

15. Complaint Management

The complaint-management module provides a centralized workflow for
transportation-related passenger complaints.

Passenger Complaint
        |
        v
Complaint Database
        |
        v
AI-Assisted Priority / Analysis
        |
        v
Administrator Review
        |
        v
Resolution / Status Update

Administrators can review complaints and update their status.

This connects passenger feedback with administrative decision-making.

16. Emergency and SOS Control Center

The emergency-management module supports coordinated handling of emergency
events.

SOS alerts can originate from:

Passengers
Drivers
Conductors

Emergency alerts are forwarded to the administrative/control-room interface.

The control center can:

View emergency alerts
Review alert information
Identify the source
Assess urgency
Update the emergency status
Mark incidents as resolved

The emergency workflow provides a centralized mechanism for responding to
transportation incidents.

17. Ticket Management

The ticket-management system connects passenger ticket purchase with
transportation personnel.

Passenger
    |
    v
Ticket Purchase
    |
    v
Central Database
    |
    +-------------------+
    |                   |
    v                   v
Conductor          Inspector
Validation         Verification

The system supports:

Ticket generation
QR-based ticket information
Ticket history
Ticket verification
Payment recording
Inspection
18. Fine Management Workflow
Inspector
    |
    v
Ticket Inspection
    |
    v
Violation Identified
    |
    v
Fine Issued
    |
    v
Passenger Dashboard
    |
    v
Fine Payment
    |
    v
Updated Fine Status

Fine information can also contribute to administrative revenue analytics.

19. Revenue Analytics

The platform provides operational revenue information.

The administrative and relevant staff dashboards can display:

Digital ticket revenue
Cash ticket revenue
Monthly-pass revenue
Fine revenue
Overall revenue indicators

These analytics support transportation management and operational monitoring.

20. Global System Synchronization

A key design principle of Chennai Transit Pulse is synchronization between
different operational modules.

Examples include:

Ticket Issued
Ticket Issued
     |
     +--> Passenger Ticket History
     |
     +--> Bus Occupancy
     |
     +--> Revenue Data
     |
     +--> Conductor Records
Fine Issued
Fine Issued
     |
     +--> Passenger Dashboard
     |
     +--> Inspector Records
     |
     +--> Administrative Analytics
Fine Paid
Fine Payment
     |
     +--> Passenger Fine Status
     |
     +--> Inspector Analytics
     |
     +--> Fine Revenue
Route Changed
Route Reassignment
     |
     +--> Driver Dashboard
     |
     +--> Conductor Dashboard
     |
     +--> Passenger Information
     |
     +--> Fleet Monitoring
SOS Alert
SOS Alert
     |
     +--> Administrative Dashboard
     |
     +--> Control Room
     |
     +--> Emergency Status
21. Database and Data Management

The platform uses a centralized database architecture for storing and
synchronizing transportation information.

Operational data can include:

User information
Passenger information
Bus information
Routes
Stops
Tickets
Payments
Wallet transactions
Monthly passes
Complaints
Fines
SOS alerts
Passenger occupancy
Driver/conductor operational information
AI recommendations
Route reassignment information

Centralized data management allows information generated by one module to
become available to other relevant modules.

22. Authentication and Role-Based Access

The platform separates transportation operations according to user roles.

Different users receive different dashboards and permissions.

User Authentication
        |
        v
Role Identification
        |
   +----+----+---------+---------+---------+
   |         |         |         |         |
Passenger  Driver  Conductor  Inspector  Admin

This role-based approach prevents all users from accessing the same
operational functions.

23. Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Backend
Supabase
PostgreSQL
Supabase Authentication
Data Management
PostgreSQL database
Centralized operational records
Role-based access control
Development and Version Control
Lovable
GitHub
Git-based version control
24. Research Prototype and Evaluation

Chennai Transit Pulse was developed as a functional web-based research
prototype.

Because live transportation-authority infrastructure and real-time
operational datasets were not available, the framework was evaluated through
simulated operational scenarios.

The evaluation scenarios include:

Passenger ticket purchase
Ticket inspection
Complaint submission and processing
Overcrowded-bus detection
Underutilized-bus identification
AI-assisted dynamic bus reallocation
SOS emergency reporting
Multi-role transportation operations

The prototype evaluation demonstrates the functional integration of the
major transportation modules and the feasibility of the proposed centralized
framework.

The prototype should not be interpreted as a full-scale deployment in the
Chennai public transportation network.

25. Research Contribution

The primary contribution of the project is the integration of multiple public
transportation functions into a unified AI-assisted operational framework.

The framework combines:

Passenger services
Digital ticketing
Bus occupancy monitoring
AI-assisted decision support
Dynamic bus reallocation
Complaint management
Ticket inspection
Fine management
Emergency response
Role-based transportation dashboards

The AI component is designed as a decision-support mechanism that provides
recommendations to human transportation administrators rather than replacing
human operational control.

26. Project Structure
chennai-transit-pulse/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── lib/
│   └── ...
│
├── supabase/
│   └── ...
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

The exact structure may evolve as the prototype is developed.

27. Running the Project
Prerequisites

Install:

Node.js
npm
Clone the Repository
git clone https://github.com/abinash-ux/chennai-transit-pulse.git
Enter the Project
cd chennai-transit-pulse
Install Dependencies
npm install
Start the Development Server
npm run dev

The local development URL will be displayed by the Vite development server.

28. Environment Configuration

The application uses environment variables for connecting to backend
services.

Sensitive credentials should never be committed to the repository.

Create a local environment file containing the required project configuration
provided by the development environment.

Example:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id

Never publish private database credentials, service-role keys, passwords,
private API keys, or other sensitive secrets.

29. Demonstration

The system contains role-specific dashboards that demonstrate the proposed
smart transportation workflow.

Passenger

Passenger services, ticketing, route planning, complaints, wallet, passes,
tracking, and emergency reporting.

Driver

Assigned route, occupancy, route-change notifications, analytics, requests,
and emergency reporting.

Conductor

Ticket issuing, ticket validation, passenger-load monitoring, revenue
analytics, overcrowding reporting, and emergency reporting.

Inspector

Ticket/pass validation, fine issuance, fine analytics, and inspection
reporting.

Administrator / Control Room

Fleet monitoring, AI-assisted routing, bus allocation, complaints, revenue,
and emergency management.

30. Source Code

The source code for the research prototype is maintained in this GitHub
repository:

https://github.com/abinash-ux/chennai-transit-pulse

The repository is synchronized with the Lovable development environment.

31. Development Platform

This project was developed using the Lovable platform and synchronized with
GitHub for source-code management and version control.

Lovable was used as a development environment; the research contribution
concerns the proposed smart public transportation framework, system
architecture, operational workflows, AI-assisted decision support, and
prototype implementation.

32. Limitations

The current implementation is a research prototype and has several
limitations.

The system has not been deployed across a live city-wide bus network.
Real-time transportation-authority operational data were not available for
the prototype evaluation.
Simulation scenarios were used for functional evaluation.
Real-world GPS, IoT passenger-counting devices, and live traffic feeds are
not part of the current prototype.
Large-scale field validation remains future work.
33. Future Development

Future versions may incorporate:

Real-time GPS integration
IoT-based passenger counting
Real-time traffic information
Machine-learning-based passenger demand forecasting
Bus arrival-time prediction
Traffic-aware route optimization
Cloud-scale transportation analytics
Predictive maintenance
Automated scheduling
Real-world transportation authority integration

These extensions would enable evaluation using live operational transportation
data.

34. Academic Context

This repository supports the research work entitled:

AI-Assisted Smart Bus Operations and Safety Management Framework

The project focuses on intelligent public transportation management through
the integration of passenger services, AI-assisted operational decision
support, dynamic bus reallocation, complaint management, ticket management,
and emergency response.

Status

Project Type: Research Prototype
Domain: Smart Cities / Intelligent Transportation Systems
Application Area: Public Bus Transportation
Development: Web-based Prototype
AI Role: Operational Decision Support
Backend: Supabase / PostgreSQL
Version Control: GitHub

