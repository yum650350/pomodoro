import React, { Component } from "react";
import gsap from "gsap";
import { Howl } from "howler";
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Slide from "@material-ui/core/Slide";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import VolumeUp from "@material-ui/icons/VolumeUpOutlined";
import VolumeDown from "@material-ui/icons/VolumeDownOutlined";
import VolumnMute from "@material-ui/icons/VolumeMuteOutlined";
import GitHub from "@material-ui/icons/GitHub";
import Settings from "@material-ui/icons/SettingsOutlined";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActiveOutlined";
import NotificationsIcon from "@material-ui/icons/NotificationsOutlined";
import NotificationsOffIcon from "@material-ui/icons/NotificationsOffOutlined";
import PaletteIcon from "@material-ui/icons/PaletteOutlined";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import { CustomEase } from "gsap/src/CustomEase";
import "./Pomodoro.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import wavUrl from "./res/tick.mp3";
import glow from "./res/glow.png"; 
const pomodoro = "./assets/scene.gltf"; 
// boot config
gsap.registerPlugin(CustomEase);
CustomEase.create(
  "LargeTrun",
  "M0,0,C0.122,0.37,0.08,0.454,0.204,0.412,0.286,0.384,0.316,0.771,0.416,0.728,0.447,0.714,0.472,0.719,0.492,0.735,0.562,0.789,0.585,0.965,0.666,0.95,0.726,0.938,0.807,0.982,0.856,0.99,0.891,0.995,0.999,1,1,1"
);
CustomEase.create(
  "MediumTrun",
  "M0,0 C0,0 0.08193,0.25035 0.13989,0.40413 0.15624,0.44751 0.17001,0.47335 0.19311,0.51242 0.20929,0.53978 0.22228,0.5587 0.24385,0.58 0.26196,0.59788 0.27919,0.61264 0.30228,0.62021 0.34195,0.63322 0.38048,0.6268 0.42273,0.63865 0.44969,0.64622 0.4706,0.65674 0.49221,0.67351 0.51522,0.69137 0.53011,0.7096 0.54727,0.73531 0.58211,0.7875 0.59665,0.83108 0.63076,0.88105 0.64236,0.89804 0.65507,0.91105 0.67298,0.91947 0.71729,0.9403 0.75454,0.95098 0.80703,0.9639 0.88,0.98187 1,1 1,1 "
);
CustomEase.create(
  "SmallTurn",
  "M0,0,C0.11,0.494,0.192,0.726,0.318,0.852,0.45,0.984,0.504,1,1,1"
);

// define themes
const themes = [
  {
    name: "mustard",
    background: "D1A701",
    marks: "067E06",
    head: "067E06",
    body: "D31A05",
    text: "#067E06"
  },
  {
    name: "pinky",
    background: "EB7C7C",
    marks: "FB2E50",
    head: "FC5A74",
    body: "FCFCFC",
    text: "#FCFCFC"
  },
  {
    name: "pony",
    background: "4C43BB",
    marks: "F046E2",
    head: "F046E2",
    body: "9DEFFD",
    text: "#C769DD"
  },
  {
    name: "army",
    background: "2B301E",
    marks: "000000",
    head: "000000",
    body: "091706",
    text: "#BDC4AD"
  },
  {
    name: "rosy",
    background: "540101",
    marks: "720202",
    head: "E10104",
    body: "EB0103",
    text: "#F09A9A"
  }
];

// define bottons
const default_btns = [
  {
    value: 30,
    isMin: false
  },
  {
    value: 5,
    isMin: true
  },
  {
    value: 25,
    isMin: true
  }
];
const round = Math.PI * 2;
const largeVal = (6 * Math.PI) / 5;
const mediumVal = (3 * Math.PI) / 5;
export default class Pomodoro extends Component {
  constructor(props) {
    super(props);
    // random theme will be chose at begin
    var index = gsap.utils.random(0, themes.length - 1, 1);

    // state initialized
    this.state = {
      log: "ddd",
      ring: false,
      volType: 2,
      bellType: 2,
      ...themes[index],
      themeIndex: index,
      creditShow: false,
      settingShow: false,
      btns: default_btns
    };

    // bind the function to component
    this.stopRing = this.stopRing.bind(this);
    this.bellSoundChanged = this.bellSoundChanged.bind(this);
    this.soundChanged = this.soundChanged.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.start = this.start.bind(this);
    this.noteShow = this.noteShow.bind(this);
    this.stopAllSound = this.stopAllSound.bind(this);
    this.modeShow = this.modeShow.bind(this);

    // define sound sprite using howler.js
    this.sound = new Howl({
      src: [wavUrl],
      sprite: {
        tick: [0, 1250, true],
        back: [5000, 1956, true],
        w1: [8000, 1200, true],
        changed: [0, 300, false]
      }
    });
    this.bellSound = new Howl({
      src: [wavUrl],
      sprite: {
        ring: [2000, 2760, true],
        ringSec: [2000, 10, false],
        changed: [2000, 200, false]
      }
    });
    this.sound.volume(60);
    this.bellSound.volume(60);
  }
  componentDidMount() {
    this.init();
  }
  changeTheme(index) {
    if (!this.isInit) return;
    if (!themes[index]) {
      index = 0;
    }
    // load values
    const theme = themes[index];
    const { background, marks, head, body } = theme;
    const control = {
      background: `#${this.scene.background.getHexString()}`,
      marks: `#${this.marks.color.getHexString()}`,
      head: `#${this.head.color.getHexString()}`,
      body: `#${this.body.color.getHexString()}`
    };

    // update state
    this.setState({ ...theme });

    // gsap the theme colors
    gsap.fromTo(control, 0.5, control, {
      background: `#${background}`,
      marks: `#${marks}`,
      head: `#${head}`,
      body: `#${body}`,
      onUpdate: function(x, y) {
        x.scene.background.set(y.background);
        x.marks.color.set(y.marks);
        x.head.color.set(y.head);
        x.body.color.set(y.body);
      },
      onUpdateParams: [this, control],
      onComplete: function(x) {
        x.setState(y => {
          return { themeIndex: index };
        });
      },
      onCompleteParams: [this]
    });

    // animate the tomato, this is really fun
    gsap.set(this.entireTomato.rotation, { z: 0 });
    gsap.to(this.entireTomato.rotation, 0.5, { z: Math.PI * 2 });

    // animate the text class
    gsap
      .timeline()
      .to(".title", 0.25, { y: 50 })
      .to(".title", 0.25, { y: 0 });
  }
  start(time, isMin) {
    if (!this.isInit) return;
    this.stopRing();
    this.stopAllSound();
    this.modeShow(isMin);
    // calculate the actual angle to turn
    // const value = (time * 60 * round) / (50 * 60);
    const value = (time * round) / 50;

    // get the difference between current and the target value
    // this will send to gsap to animate model
    const diff = Math.abs(this.proTop.rotation.z) - Math.abs(value);

    // get the absolute value of the difference value
    // this will decide whitch animation will gsap use
    const diffAbs = Math.abs(diff);

    // define the truning power, there are 3 types of turning animation
    let power = diffAbs >= mediumVal ? (diffAbs >= largeVal ? 2 : 1) : 0;

    // kill all if there is any tweening on the object
    const isTweening = gsap.isTweening(this.proTop.rotation);
    if (isTweening) {
      gsap.killTweensOf(this.proTop.rotation);
    }

    // check the turning is backward or frontward
    // different soundtrack will play
    if (diff > 0) {
      this.sound.play("back");
    } else {
      this.sound.play("w1");
    }

    // gsap part

    // define ease
    const turnEase =
      diff > 0
        ? "none"
        : power === 2
        ? `LargeTrun`
        : power === 1
        ? `MediumTrun`
        : "SmallTrun";

    // define the wind up duration
    const preDiff = diff > 0 ? diffAbs / 1.5 : diffAbs / 3.5;

    // we dont want to get too many decimals
    // a long number of duration will crash gsap
    let size = Math.pow(10, 2);
    const windUpDuration = Math.round(preDiff * size) / size;

    //
    gsap
      .timeline()
      .to(this.proTop.rotation, windUpDuration, {
        z: -value,
        ease: turnEase,
        onComplete: x => {
          x.stopAllSound();
          x.sound.play("tick");
        },
        onCompleteParams: [this]
      })
      .to(this.proTop.rotation, (isMin ? 60 : 1) * time, {
        z: 0,
        ease: "none",
        onComplete: (x, y) => {
          x.stopAllSound();
          if (!y) {
            x.setState({ ring: true });
            gsap.fromTo(
              x.proTop.position,
              0.1,
              {
                z: 0.01,
                ease: "none"
              },
              {
                z: -0.01,
                ease: "none",
                repeat: -1
              }
            );
            x.noteShow(true);
            x.bellSound.play("ring");
          } else {
            x.bellSound.play("ringSec");
          }
        },
        onCompleteParams: [this, time === 0]
      });
  }
  noteShow(show) {
    if (show) {
      gsap.fromTo(
        ".note",
        1,
        {
          y: -50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1
        }
      );
    } else {
      gsap.to(".note", 1, {
        y: 25,
        opacity: 0
      });
    }
  }
  modeShow(min) {
    if (this.currentMode !== min)
      gsap.fromTo(
        min ? ".min" : ".sec",
        1,
        {
          x: -50,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1
        }
      );
    gsap.to(!min ? ".min" : ".sec", 1, {
      x: 50,
      opacity: 0
    });
    this.currentMode = min;
  }
  stopRing() {
    const { ring } = this.state;
    if (ring) {
      this.stopAllSound();
      this.setState({ ring: false });

      // kill all tween and set position to the initial
      gsap.killTweensOf(this.proTop.position);
      gsap.set(this.proTop.position, { z: 0 });

      // ui
      this.noteShow(false);
    }
  }
  stopAllSound() {
    this.sound.stop();
    this.bellSound.stop();
  }
  bellSoundChanged(e, v) {
    const { bellType } = this.state;
    let newbellType;
    if (v === 0) {
      newbellType = 0;
    } else if (v > 50) {
      newbellType = 2;
    } else {
      newbellType = 1;
    }
    if (newbellType !== bellType) {
      this.setState({
        bellType: newbellType
      });
    }

    this.bellSound.volume(v / 100);
  }
  soundChanged(e, v) {
    const { volType } = this.state;
    let newVolType;
    if (v === 0) {
      newVolType = 0;
    } else if (v > 50) {
      newVolType = 2;
    } else {
      newVolType = 1;
    }
    if (newVolType !== volType) {
      this.setState({
        volType: newVolType
      });
    }
    this.sound.volume(v / 100);
  }
  init() {
    const { themeIndex } = this.state;
    const { background, marks, head, body } = themes[themeIndex];

    // render in the canvas component
    const canvas = this.canvas;
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    // create a perspective camera
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera = camera;
    camera.position.set(0, 10, 20);

    // add OrbitControls to canvas
    const controls = new OrbitControls(camera, canvas);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    controls.panSpeed = 0;
    controls.maxZoom = 1;
    controls.minZoom = 0.5;
    controls.enableKeys = false;
    controls.maxPolarAngle = Math.PI * (2 / 3);
    controls.minPolarAngle = Math.PI / 3;
    // controls.target.set(0, 5, 0);
    controls.update();
    this.controls = controls;

    // create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#" + background);
    this.scene = scene;

    // light control
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    this.hemiLight = hemiLight;
    const DlightColor = 0xc99f7f;

    // glow light source one
    const lightMaterial = new THREE.MeshLambertMaterial({
      visible: false
    });
    const glowMap = new THREE.TextureLoader().load(glow);
    const Dlight = new THREE.PointLight(DlightColor, 0.7);
    Dlight.decay = 2;
    Dlight.position.multiplyScalar(30);
    Dlight.color.setHSL(0.6, 0, 0.8);
    Dlight.position.set(40, 30, 30);
    scene.add(Dlight);
    this.Dlight = Dlight;

    var geometry = new THREE.SphereGeometry(0.5, 16, 16);
    var mesh = new THREE.Mesh(geometry, lightMaterial);
    mesh.position.set(40, 30, 30);
    scene.add(mesh);
    var spriteMaterial = new THREE.SpriteMaterial({
      map: glowMap,
      color: 0xc99f7f,
      blending: THREE.AdditiveBlending
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(6, 6, 1.0);
    mesh.add(sprite);

    // glow light source two
    const Dlight2 = new THREE.PointLight(DlightColor, 0.2);
    Dlight2.decay = 2;
    Dlight2.color.setHSL(0.7, 1, 0.8);
    Dlight2.position.set(-30, 30, 30);
    scene.add(Dlight2);
    this.Dlight2 = Dlight2;
    var geometry2 = new THREE.SphereGeometry(0.2, 16, 16);
    var mesh2 = new THREE.Mesh(geometry2, lightMaterial);
    mesh2.position.set(-30, 30, 30);
    scene.add(mesh2);
    var spriteMaterial2 = new THREE.SpriteMaterial({
      map: glowMap,
      color: DlightColor,
      transparent: false,
      blending: THREE.AdditiveBlending
    });
    spriteMaterial2.color.setHSL(0.7, 1, 0.8);
    var sprite2 = new THREE.Sprite(spriteMaterial2);
    sprite2.scale.set(3, 3, 1.0);
    mesh2.add(sprite2);

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
      const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
      const halfFovY = THREE.Math.degToRad(camera.fov * 0.5);
      const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
      // compute a unit vector that points in the direction the camera is now
      // in the xz plane from the center of the box
      const direction = new THREE.Vector3()
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1.2, 0.6, 1.2))
        .normalize();
      // move the camera to a position distance units way from the center
      // in whatever direction the camera was from the center already
      camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

      // pick some near and far values for the frustum that
      // will contain the box.
      camera.near = boxSize / 100;
      camera.far = boxSize * 100;

      camera.updateProjectionMatrix();

      // point the camera to look at the center of the box
      camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }
    {
      // load gltf file
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(pomodoro, gltf => {
        // add to scene while loaded
        const root = gltf.scene;
        scene.add(root);

        // get the entire model, use it to animate by gsap later
        var entireTomato = root.getObjectByName(
          "Collada_visual_scene_group",
          true
        );
        this.entireTomato = entireTomato;

        // get the top half of the model,
        // use it to animate by gsap later
        var proTop = root.getObjectByName("Empty", true);
        this.proTop = proTop;

        // disable the object that we will not use
        var plane = root.getObjectByName("Plane_003", true);
        plane.visible = false;

        // get all the materials of the model,
        // later we will animate the color using gsap
        const th = this;
        root.traverse(function(child) {
          if (child.material) {
            if (child.material.name === "Material_001") {
              child.material.color.set("#" + marks);
              th.marks = child.material;
            } else if (child.material.name === "Material_003") {
              child.material.color.set("#" + body);
              th.body = child.material;
            } else if (child.material.name === "Material_002") {
              child.material.color.set("#" + head);
              th.head = child.material;
            }
          }
        });

        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
        this.boxSize = boxSize;
        this.boxCenter = boxCenter;
        // set the camera to frame the box
        frameArea(boxSize * 1, boxSize, boxCenter, camera);

        // update controls
        controls.maxDistance = boxSize * 2;
        controls.minDistance = boxSize * 0.5;
        controls.target.copy(boxCenter);
        controls.update();

        // let the application knows it's all loaded
        this.isInit = true;
      });
    }
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
    function render() {
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }
  render() {
    const {
      volType,
      bellType,
      creditShow,
      text,
      background,
      settingShow,
      btns
    } = this.state;

    return (
      <div className="container">
        <canvas
          ref={x => (this.canvas = x)}
          id="c"
          onTouchStart={this.stopRing}
          onClick={this.stopRing}
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            display: "block"
          }}
        ></canvas>
        <div className="ui">
          <div className="title" style={{ color: text }}>
            <div>pomodor</div>
            <Link
              style={{
                color: text
              }}
              className="link"
              target="_blank"
              href="https://github.com/yum650350/pomodoro"
            >
              <GitHub className="github" />
            </Link>
            {/* <span className="t text" style={{ color: text }}></span> */}
          </div>
          <div className="note">
            <span style={{ color: text }}>Click to stop ringing</span>
          </div>
          <div className="mode" style={{ color: text }}>
            <div className="min"> Mode : Minute</div>
            <div className="sec"> Mode : Sec</div>
          </div>
          <div className="controllers">
            <div style={{ display: "flex" }}>
              <ButtonGroup fullWidth size="large" color="primary">
                {btns.map((x, i) => (
                  <Button
                    className="tbtn"
                    key={`s${i}`}
                    onClick={() => this.start(x.value, x.isMin)}
                    style={{
                      color: text,
                      borderColor: text
                    }}
                  >
                    {`${x.value} ` + (x.isMin ? "min" : "sec")}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Button
                onClick={() => this.setState({ settingShow: true })}
                className="cbtn"
                style={{
                  color: text
                }}
              >
                <Settings />
              </Button>
              <Button
                className="cbtn"
                key={`sz`}
                onClick={() => this.start(0, true)}
                style={{
                  color: text
                }}
              >
                Zero
              </Button>
              <Button
                onClick={() => this.changeTheme(this.state.themeIndex + 1)}
                className="cbtn"
                style={{
                  color: text
                }}
              >
                <PaletteIcon />
              </Button>
              <Button
                onClick={() => this.setState(x => ({ creditShow: true }))}
                className="cbtn"
                style={{
                  color: text
                }}
              >
                <InfoIcon />
              </Button>
            </div>
          </div>
          <div className="slider right">
            <Slider
              style={{
                color: text,
                borderColor: text
              }}
              valueLabelDisplay="off"
              orientation="vertical"
              defaultValue={60}
              onChange={this.soundChanged}
              onChangeCommitted={() => this.sound.play("changed")}
            />
            {volType === 0 ? (
              <VolumnMute style={{ margin: 5, color: text }} />
            ) : volType === 2 ? (
              <VolumeUp style={{ margin: 5, color: text }} />
            ) : (
              <VolumeDown style={{ margin: 5, color: text }} />
            )}
          </div>
          <div className="slider left">
            <Slider
              style={{
                color: text,
                borderColor: text
              }}
              valueLabelDisplay="off"
              orientation="vertical"
              defaultValue={60}
              onChange={this.bellSoundChanged}
              onChangeCommitted={() => this.bellSound.play("changed")}
            />
            {bellType === 0 ? (
              <NotificationsOffIcon style={{ margin: 5, color: text }} />
            ) : bellType === 2 ? (
              <NotificationsActiveIcon style={{ margin: 5, color: text }} />
            ) : (
              <NotificationsIcon style={{ margin: 5, color: text }} />
            )}
          </div>
        </div>
        <Modal
          className="modal"
          open={creditShow}
          onClose={() => this.setState({ creditShow: false })}
        >
          <Slide in={creditShow}>
            <div
              className="content credit"
              style={{
                color: text,
                backgroundColor: `#${background}`
              }}
            >
              <Typography className="title" variant="h5">
                {"Credits"}
              </Typography>
              <div className="space"></div>
              <section>
                <Typography className="subTitle" variant="subtitle1">
                  {"Model"}
                </Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://sketchfab.com/balazus"
                >
                  Pomodoro
                </Link>
                <Typography className="author">
                  {" by balazus@sketchfab.com"}
                </Typography>
              </section>
              <section>
                <Typography className="subTitle" variant="subtitle1">
                  {"Audio"}
                </Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://freesound.org/people/bone666138/sounds/198841/"
                >
                  Analog Alarm Clock
                </Link>
                <Typography className="author">
                  {" by bone666138@freesound"}
                </Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://freesound.org/people/bone666138/sounds/198841/"
                >
                  Ticking Timer
                </Link>
                <Typography className="author">
                  {" by parkersenk@freesound.org"}
                </Typography>
              </section>
              <section>
                <Typography className="subTitle" variant="subtitle1">
                  {"UI"}
                </Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://material-ui.com/"
                >
                  MATERIAL-UI
                </Link>
                <Typography className="author">{" by mui-org"}</Typography>
              </section>
              <section>
                <Typography className="subTitle" variant="subtitle1">
                  {"Library"}
                </Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://reactjs.org/"
                >
                  React
                </Link>
                <Typography className="author">{" by Facebook"}</Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://threejs.org/"
                >
                  three.js
                </Link>
                <Typography className="author">
                  {" from mrdoob@github"}
                </Typography>
                <Link
                  style={{
                    color: text
                  }}
                  className="link"
                  target="_blank"
                  href="https://howlerjs.com/"
                >
                  HOWLER.JS
                </Link>
                <Typography className="author">
                  {" by James Simpson"}
                </Typography>
              </section>
            </div>
          </Slide>
        </Modal>

        <Modal
          className="modal"
          open={settingShow}
          onClose={() => this.setState({ settingShow: false })}
        >
          <Slide in={settingShow}>
            <div
              className="content w250"
              style={{
                color: text,
                backgroundColor: `#${background}`
              }}
            >
              <Typography className="title" variant="h5">
                {"Setting"}
              </Typography>
              <div className="space"></div>
              <section className="center">
                {btns.map((x, i) => (
                  <div className="setItem" key={`si${i}`}>
                    <input
                      style={{
                        background: `#${background}`,
                        color: text
                      }}
                      type="text"
                      value={x.value}
                      pattern="[0-9]*"
                      onChange={x => {
                        btns[i].value = x.target.value;
                        this.setState(y => ({
                          ...y.btns,
                          ...btns
                        }));
                      }}
                    />
                    <Button
                      className="typeBtn"
                      style={{
                        color: `#${background}`,
                        background: text,
                        border: "1px solid"
                      }}
                      onClick={() => {
                        btns[i].isMin = !x.isMin;
                        this.setState(y => ({
                          ...y.btns,
                          ...btns
                        }));
                      }}
                    >
                      {x.isMin ? "Min" : "Sec"}
                    </Button>
                  </div>
                ))}
              </section>
            </div>
          </Slide>
        </Modal>
      </div>
    );
  }
}
