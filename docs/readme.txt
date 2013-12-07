readme.txt // 2013-12-07 // Team Facade


Project purpose 
--------------- 
Team Facade was focused on two aspects of the Sensor Data Service Platform —
sensor visualization and the virtual sensor editor.

  Sensor Visualization 
  --------------------
  The sensor dashboard graphically displays the status of all of the sensors via
  color coding. It consists of two views—a topographical view and a geographical
  view. The topological view shows the logical layout of the sensors and the
  geographical view shows the location of the sensors on a map.

  Virtual Sensor Editor 
  ---------------------
  The virtual sensor editor (VSE) is a GUI-based tool that allows you to create
  virtual sensor output from physical sensor input. For example, you can create a
  virtual sensor that displays the real-time average temperature of all of the
  rooms on the first floor of Carnegie Mellon Silicon Valley’s (CMUSV) building
  23. This can be accomplished by dragging representations of the physical sensors
  onto a canvas and then drawing connections between them and a function box. The
  function box contains a JavaScript expression that is evaluated using the
  connected physical sensors’ data as arguments. The resulting value can either be
  connected to further function boxes for further processing or saved as a virtual
  sensor.

  System Enhancements 
  -------------------
  Team Facade was tasked with enhancing the dashboard and VSE by adding new
  features as described in the following sections.

    Dashboard visualization 
    -----------------------
    When the course started, the Sensor Data Service Platform was in a state of
    transition to new hardware and software. The old API was hosted on Heroku, the
    new one on einstein.sv.cmu.edu. At the time Team Facade forked the code from the
    gh-pages branch of the main repo on GitHub, the dashboard code was calling the
    Heroku API, which was no longer active. Team Facade started by updating the code
    to call the Einstein API. Next, the team worked to color code the sensors so
    that working sensors are displayed in blue, and sensors that are not working are
    displayed in red. Finally, the team fixed the data graph so that it displays
    historical data for a given sensor.

    Control flows 
    -------------
    Team Facade implemented a true/false decision control flow object within the VSE
    to make it possible to make a decision based on the value of a physical or
    virtual sensor.

    Taverna Integration
    -------------------
    Team Facade implemented the ability for the VSE to export a virtual sensor to
    XML for saving and reloading in Taverna (citation: "Taverna - open source and
    domain independent Workflow Management System." Taverna. N.p., n.d. Web. 7 Dec.
    2013. <http://www.taverna.org.uk/>. ), an open-source workflow management
    program.

    Geofencing 
    ----------
    In the future, the Sensor Data Service Platform will be able to make use of
    mobile devices as ad hoc sensors. To make this work, it is necessary to know
    when a device is within a room so that its data can be associated with the
    correct location. Team Facade implemented two algorithms to detect when a point
    is within a polygon so that future teams can determine when a mobile device is
    within a given geofence.


Setup 
----- 
$ git clone -b gh-pages https://github.com/johnleee/VirtualSensorEditor.git

Deployment 
---------- 
$ cd VirtualSensorEditor 
$ python -m SimpleHTTPServer 
open browser to http://localhost:8000 for dashboard 
open browser to http://localhost:8000/designtool.html for VSE 
open browser to http://localhost:8000/PointInPolygon.html for geofencing