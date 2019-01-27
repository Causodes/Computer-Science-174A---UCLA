window.Fishing_Game = window.classes.Fishing_Game =
class Fishing_Game extends Scene_Component
  { constructor( context, control_box )    
      { super(   context, control_box );    
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

//          context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0, -20, 15 ), Vec.of( 0,0,0 ), Vec.of( 0,10, 0 ) );

                  // beginning look at sign
        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0, -5, 1030 ), Vec.of( 0, 100, 0 ), Vec.of( 0, 10, 0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        let gl = [];
        let element = document.getElementById("main-canvas");
        const canvas =  element.children[0];
        for ( let name of [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ] )   // Get the GPU ready, creating a new WebGL context
            if (  gl = this.gl = canvas.getContext( name ) ) break;                    // for this canvas.
        if   ( !gl ) throw "Canvas failed to make a WebGL context.";


        //Shadow mapping
        this.webgl_manager = context;      // Save off the Webgl_Manager object that created the scene.
        this.scratchpad = document.createElement('canvas');
        this.scratchpad_context = this.scratchpad.getContext('2d');     // A hidden canvas for re-sizing the real canvas to be square.
        this.scratchpad.width   = 256;
        this.scratchpad.height  = 256;
        this.texture = new Texture ( context.gl, "", false, false );        // Initial image source: Blank gif file
        this.texture.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";


        const shapes = { box:       new Cube(),
                         plane:     new Square(),
                         sphere6:   new Subdivision_Sphere(6),
                         pond:      new ( Circle.prototype.make_flat_shaded_version() ) ( 20, 20), 
                         torus:     new Torus( 20, 20 ) ,
                         cylinder:  new Capped_Cylinder(20, 20),
                         tree_stem: new Shape_From_File( "assets/MapleTreeStem.obj" ),
                         tree_leaves: new Shape_From_File( "assets/MapleTreeLeaves.obj" ),
                         grass:     new Shape_From_File( "assets/Grass_03.obj"),
                         rock:      new Shape_From_File( "assets/Rock.obj"),
                         circle:    new Circle(),
                         mText:      new Text_Line(35),
                       }
        this.submit_shapes( context, shapes );
        this.shapes.mText.set_string("Nice!");

        this.materials =     
          { pond:          context.get_instance( Phong_Shader ).material( Color.of( 0, 123/255, 167/255, .5 ), { ambient: 0.3} ),
            ground:          context.get_instance( Fake_Bump_Map ).material( Color.of( 109/255, 78/255, 0/255, 1 ), { ambient: .40, texture: context.get_instance( "assets/ground_texture.jpeg", false ) } ),
            shadow:         context.get_instance(Shadow_Shader).material( Color.of( 71/255, 59/255, 51/255, 1 ), { ambient: 1, texture: this.texture } ),
            red:            context.get_instance( Phong_Shader ).material( Color.of( 1 ,0, 0 ,1 ), { ambient: 1 } ),
            green:          context.get_instance( Phong_Shader ).material( Color.of( 0 ,1, 0 ,1 ), { ambient: 1 } ),
            white:          context.get_instance( Phong_Shader ).material( Color.of( 1 ,1, 1 ,1 ), { ambient: 1 } ),  
            king_Fish:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/King_Of_The_Pond.png", false ) } ),
            mystery_Fish:   context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Mystery_Fish.png", false ) } ),
            plain_Fish:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Plain_Ol_Fish.png", false ) } ),
            small_Fry:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Small_Fry.png", false ) } ),
            touchy_Fish:    context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Touchy_Fish.png", false ) } ),
            nibbler:        context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Nibbler.png", false ) } ),
            friedman_Fish:       context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/friedman.jpeg", false ) } ),
            start_sign:           context.get_instance( Fake_Bump_Map ).material( Color.of( 0, 0, 0,1 ), { ambient: .8, diffusivity: .5, specularity: .5 , texture: context.get_instance( "assets/start_sign.jpg", false )  } ),
            end_sign:           context.get_instance( Fake_Bump_Map ).material( Color.of( 0, 0, 0,1 ), { ambient: .8, diffusivity: .5, specularity: .5 , texture: context.get_instance( "assets/end_game.jpg", false )  } ),
            tree_leaves:    context.get_instance( Fake_Bump_Map ).material( Color.of( 0,.6,0,1 ), { ambient: .7, diffusivity: .5, specularity: .5 } ),
            tree_stem:      context.get_instance( Fake_Bump_Map ).material( Color.of( 70/255, 50/255, 5/255,1 ), { ambient: .9, diffusivity: .5, specularity: .5 } ),
            rock:           context.get_instance( Fake_Bump_Map ).material( Color.of( 86/255, 64/255, 29/255,1 ), { ambient: .5, diffusivity: 5, specularity: .5 , texture: context.get_instance( "assets/rock_tex.jpg", false )  } ),
            text_image:        context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, diffusivity: 0, specularity: 0, texture: context.get_instance( "/assets/text.png", false ) } ),
          }

        this.lights = [ new Light( Vec.of( 0, 5, 40, 1 ), Color.of( 250/255,214/255,165/255,1 ), 1000 ) ];

        this.t_reset = false;

        this.fanfare = new Audio("assets/Fanfare.flac");
        this.fanfare.loop = false;
        this.fanfare_count = 0;
        this.menu = new Audio("assets/Menu.flac");
        this.menu.loop = true;
        this.menu_volume = 0.5;
        this.veiled_in_black = new Audio("assets/Veiled in Black.flac");
        this.veiled_in_black.loop = true;
        this.veiled_in_black_volume = 0.5;
        this.veiled_in_black.volume = 0.5;
        this.splash = new Audio("assets/splash.mp3");
        this.splash.loop = false;

        this.crosshair_Matrix = Mat4.identity().times( Mat4.scale([1, 1, .1]));
        this.sphere1_Matrix = Mat4.identity().times( Mat4.scale([1, 1, .1]));
        this.sphere2_Matrix = Mat4.identity().times( Mat4.scale([1, 1, .1]));
        this.torus1_Matrix = Mat4.identity().times( Mat4.scale([1, 1, .1]));
        this.torus2_Matrix = Mat4.identity().times( Mat4.scale([1, 1, .1]));
        this.cylinder_Matrix = Mat4.identity().times( Mat4.scale([1, 1, .1]));

        this.king_Fish_Matrix = Mat4.identity().times( Mat4.translation([20, 20, -.15]));  
        this.king_angle = 0
        this.king_model_spawn = Mat4.identity().times( Mat4.scale([.2, .05, .2]));
        this.king_spawn_time = Math.random() * 12 + 15;
        this.king_dist = 0.01;
        this.king_caught = false;

        this.friedman_Fish_Matrix = Mat4.identity().times( Mat4.translation([20, 20, -.15])).times( Mat4.scale([4, 1.5, 1]));
        this.friedman_angle = 0;
        this.friedman_direction = -1;
        this.friedman_caught = false;

        this.mystery_Fish_Matrix = Mat4.identity().times( Mat4.translation([20, 20, -0.1])); 
        this.mystery_angle = 0;
        this.mystery_model_spawn = Mat4.identity().times( Mat4.scale([.2, .05, .2]));
        this.mystery_spawn_time = Math.random() * 12 + 10;
        this.mystery_dist = 0.01;
        this.mystery_caught = false;
        this.mystery_direction = -1;

        this.plain_Fish_Matrix = Mat4.identity().times( Mat4.translation([Math.random() * 2 - 1, Math.random() * 2 - 1, 0])).times(Mat4.scale([.7,.7,.7]));
        this.plain_angle = Math.random() * 2 * Math.PI;
        this.plain_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.plain_spawn_time = Math.random() * 8;
        this.plain_caught = false;

        this.plain1_Fish_Matrix = Mat4.identity().times( Mat4.translation([Math.random() * 2 - 1, Math.random() * 2 - 1, -0.05])).times(Mat4.scale([.7,.7,.7]));
        this.plain1_angle = Math.random() * 2 * Math.PI;
        this.plain1_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.plain1_spawn_time = Math.random() * 8;
        this.plain1_caught = false;

        this.plain2_Fish_Matrix = Mat4.identity().times( Mat4.translation([Math.random() * 2 - 1, Math.random() * 2 - 1, -0.05])).times(Mat4.scale([.7,.7,.7]));
        this.plain2_angle = Math.random() * 2 * Math.PI;
        this.plain2_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.plain2_spawn_time = Math.random() * 8;
        this.plain2_caught = false;

        this.small_Fry_Matrix = Mat4.identity().times( Mat4.translation([0, 0, 0.1])).times(Mat4.scale([.5,.5,.5])); 
        this.small_Fry_Matrix = this.small_Fry_Matrix.times( Mat4.translation([0, -5, 0]));
        this.fry_angle = Math.random() * 2 * Math.PI;
        this.fry_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry_spawn_time = Math.random() * 8;
        this.fry_dist = 0.01;
        this.fry_caught = false;

        this.small_Fry1_Matrix = Mat4.identity().times( Mat4.translation([0, 0, 0.05])).times(Mat4.scale([.5,.5,.5])); 
        this.fry1_angle = Math.random() * 2 * Math.PI;
        this.fry1_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry1_spawn_time = Math.random() * 8;
        this.fry1_dist = 0.01;
        this.fry1_caught = false;

        this.small_Fry2_Matrix = Mat4.identity().times( Mat4.translation([0, 0, 0.05])).times(Mat4.scale([.5,.5,.5])); 
        this.fry2_angle = Math.random() * 2 * Math.PI;
        this.fry2_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry2_spawn_time = Math.random() * 8;
        this.fry2_caught = false;

        this.small_Fry3_Matrix = Mat4.identity().times( Mat4.translation([0, 0, 0.05])).times(Mat4.scale([.5,.5,.5])); 
        this.fry3_angle = Math.random() * 2 * Math.PI;
        this.fry3_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry3_spawn_time = Math.random() * 8;
        this.fry3_caught = false;

        this.small_Fry4_Matrix = Mat4.identity().times( Mat4.translation([0, 0, 0.05])).times(Mat4.scale([.5,.5,.5])); 
        this.fry4_angle = Math.random() * 2 * Math.PI;
        this.fry4_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry4_spawn_time = Math.random() * 8;
        this.fry4_caught = false;
	
        this.touchy_Fish_Matrix = Mat4.identity().times( Mat4.translation([20, 20, 0.1])).times(Mat4.scale([.5,.5,.5]));
        this.touchy_angle = 0;
        this.touchy_model_spawn = Mat4.identity().times( Mat4.scale([.05, .05, .05]));
        this.touchy_spawn_time = Math.random() * 12 + 10;
        this.touchy_dist = 0.01;
        this.touchy_caught = false;

        this.nibbler_Matrix = Mat4.identity().times( Mat4.translation([20, 20, 0.15])).times(Mat4.scale([.5,.5,.5])); 
        this.nibbler_angle = 0;
        this.nibbler_model_spawn = Mat4.identity().times( Mat4.scale([.05, .05, .05]));
        this.nibbler_spawn_time = Math.random() * 12 + 1;
        this.nibbler_direction = -1;
        this.nibbler_caught = false;        

                  // RENDER TERRAIN MATRIXES
        this.sign_Matrix = Mat4.identity().times( Mat4.scale([10, 10, 10]))
                                          .times( Mat4.translation( [0, 0, 100 ]));

        this.backdrop_Matrix = Mat4.identity().times( Mat4.translation([0, 100, 1]))
                                              .times( Mat4.rotation( 1.6, Vec.of(1, 0, 0)))
                                              .times( Mat4.scale([ 200, 100, 1]));
         
        this.pond_Matrix = Mat4.identity();
        this.pond_Matrix = this.pond_Matrix.times( Mat4.translation([0, 0, 1]))
                                           .times( Mat4.scale([7, 7, .01]));
        
        this.ground_Matrix = Mat4.identity();
        this.ground_Matrix = this.ground_Matrix.times( Mat4.translation([0, 0, 1]))
                                           .times( Mat4.scale([42.6, 42.6, .01]));                                           

        this.bottom_Matrix = Mat4.identity();
        this.bottom_Matrix = this.bottom_Matrix.times( Mat4.translation([0, 0, -1]))
                                           .times( Mat4.scale([15, 15, .01]))
                                           .times( Mat4.rotation(Math.PI, [1.3,0,0]) );

        this.tree_Matrix = Mat4.identity();
        this.tree_Matrix = this.tree_Matrix.times( Mat4.rotation( 1.6, Vec.of( 1, 0, 0)))
                                          .times( Mat4.translation([-13, 5.5, -7 ]))
                                           .times( Mat4.scale([1.5, 1.5, 1.5]));

        this.tree_Matrix2 = Mat4.identity();
        this.tree_Matrix2 = this.tree_Matrix2.times( Mat4.rotation( 1.6, Vec.of( 1, 0, 0)))
                                          .times( Mat4.translation([-15, 9, -5 ]))
                                           .times( Mat4.scale([4, 4, 4]));

        this.tree_Matrix1 = this.tree_Matrix.times( Mat4.translation([21, 0, 0 ]))
                                            .times( Mat4.scale([1.5, 1.5, 1.5]));

        this.rock_Matrix = Mat4.identity().times( Mat4.rotation( 1.6, Vec.of( 0, 1, -.1)))
                                          .times( Mat4.translation([ -0, -7, 11 ]))
                                          .times (Mat4.scale([8, 2, 2]));
      
        this.catching = false;
        this.catching_timer = 0;  
        this.zoom_animation = false;
        this.start_zoom = -1;

        this.can_start_to_catch = false;
        this.fish_is_caught = false;
        this.caught_fish_material = null;
        this.caught_fish_matrix = null;
        this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0;

        this.pause = true;
        this.time = 0;            
           
        this.ending_animation = false;
        this.beginning_animation = true;
        this.begin_animation = false;
        this.animation_t = 0;
        this.graphics_state = context.globals.graphics_state;
        this.storedCamera = null;
      }

    make_control_panel()
      { 
        this.key_triggered_button( "Move Left", [ "j" ], this.move_left );
        this.key_triggered_button( "Move Right", [ "l" ], this.move_right );
        this.key_triggered_button( "Move Up", [ "i" ], this.move_up );
        this.key_triggered_button( "Move Down", [ "k" ], this.move_down );
        this.key_triggered_button( "Start Game", [ "m" ], () => { if(!this.begin_animation)
                                                                  this.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0, -40, 30 ), Vec.of( 0, 0, 0 ), Vec.of( 0, 10, 0 ) );
                                                                  this.begin_animation = true;
                                                                  this.t_reset = false;
                                                                });
        this.key_triggered_button( "Catch Fish", [ ";" ], () => { if(!this.fish_is_caught && !this.catching) this.catch_fish() } );              

//         this.result_img = this.control_panel.appendChild( Object.assign( document.createElement( "img" ), 
//                 { style:"width:200px; height:" + 200 * this.aspect_ratio + "px" } ) );
                
      }

    move_left()
     {
        if((this.crosshair_Matrix[0][3] - 0.2) * (this.crosshair_Matrix[0][3] - 0.2) + (this.crosshair_Matrix[1][3]) * (this.crosshair_Matrix[1][3]) < 72.25 && !this.catching)
        {
            this.crosshair_Matrix = this.crosshair_Matrix.times( Mat4.translation([-0.2, 0, 0]));       
        } 
     }

    move_right()
     {
        if((this.crosshair_Matrix[0][3] + 0.2) * (this.crosshair_Matrix[0][3] + 0.2) + (this.crosshair_Matrix[1][3]) * (this.crosshair_Matrix[1][3]) < 72.25 && !this.catching)
        {
            this.crosshair_Matrix = this.crosshair_Matrix.times( Mat4.translation([0.2, 0, 0]));
        }           
     }

    move_up()
     {
        if((this.crosshair_Matrix[0][3]) * (this.crosshair_Matrix[0][3]) + (this.crosshair_Matrix[1][3] + 0.2) * (this.crosshair_Matrix[1][3] + 0.2) < 72.25 && !this.catching)
        {
            this.crosshair_Matrix = this.crosshair_Matrix.times( Mat4.translation([0, 0.2, 0]));
        }          
     }

    move_down()
     {
        if((this.crosshair_Matrix[0][3]) * (this.crosshair_Matrix[0][3]) + (this.crosshair_Matrix[1][3] - 0.2) * (this.crosshair_Matrix[1][3] - 0.2) < 72.25 && !this.catching)
        {
            this.crosshair_Matrix = this.crosshair_Matrix.times( Mat4.translation([0, -0.2, 0]));
        }           
     }
     trigger_animation(graphics_state) {
          var desired = Mat4.look_at( Vec.of( 0, -20, 15 ), Vec.of( 0,0,0 ), Vec.of( 0,10, 0 ) );
          desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix( x, .05));
          graphics_state.camera_transform = desired; 
          this.animation_t += 0.01;
        if (this.animation_t >= 1)
            this.beginning_animation = false;
     }

    catch_fish()
     {
        var x = this.crosshair_Matrix[0][3];
        var y = this.crosshair_Matrix[1][3];

        this.catching = true;

        if(Math.abs((this.king_Fish_Matrix[0][3] + Math.cos(this.king_angle) - 0.3 * Math.sin(this.king_angle)) - x) < 2 && Math.abs((this.king_Fish_Matrix[1][3] + 0.3 * Math.cos(this.king_angle) + Math.sin(this.king_angle)) - y) < 2 && !this.king_caught)
        {
            this.splash.play();
            this.king_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.king_Fish;
            this.king_Fish_Matrix[0][0] = 0;this.king_Fish_Matrix[0][1] = -1;
            this.king_Fish_Matrix[1][0] = 1;this.king_Fish_Matrix[1][1] = 0;
            this.king_Fish_Matrix[2][0] = 1;this.king_Fish_Matrix[2][1] = 0;
            this.king_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3]+.30;
            this.king_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-.70;  
            this.caught_fish_matrix = this.king_Fish_Matrix.times(Mat4.scale([1, 0.5, 1]));
        }
        else if(Math.abs((this.mystery_Fish_Matrix[0][3] + Math.cos(this.mystery_angle)) - x) < 1 && Math.abs((this.mystery_Fish_Matrix[1][3] + Math.sin(this.mystery_angle)) - y) < 1 && !this.mystery_caught)
        {
            this.splash.play();
            this.mystery_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.mystery_Fish;
            this.mystery_Fish_Matrix[0][0] = 0;this.mystery_Fish_Matrix[0][1] = -1;
            this.mystery_Fish_Matrix[1][0] = 1;this.mystery_Fish_Matrix[1][1] = 0;
            this.mystery_Fish_Matrix[2][0] = 1;this.mystery_Fish_Matrix[2][1] = 0;
            this.mystery_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3];
            this.mystery_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-1;  
            this.caught_fish_matrix = this.mystery_Fish_Matrix.times(Mat4.scale([1, 0.5, 1]));
        }
        else if(Math.abs((this.plain_Fish_Matrix[0][3] + 0.25 * Math.cos(this.plain_angle)) - x) < 1 && Math.abs((this.plain_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain_angle)) - y) < 1 && !this.plain_caught)
        {
            this.splash.play();
            this.plain_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.plain_Fish;
            this.plain_Fish_Matrix[0][0] = 0;this.plain_Fish_Matrix[0][1] = -1;
            this.plain_Fish_Matrix[1][0] = 1;this.plain_Fish_Matrix[1][1] = 0;
            this.plain_Fish_Matrix[2][0] = 1;this.plain_Fish_Matrix[2][1] = 0;
            this.plain_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.plain_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-.5;
            this.plain_Fish_Matrix = this.plain_Fish_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.plain_Fish_Matrix;
        }
        else if(Math.abs((this.plain1_Fish_Matrix[0][3] + 0.25 * Math.cos(this.plain1_angle)) - x) < 1 && Math.abs((this.plain1_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain1_angle)) - y) < 1 && !this.plain1_caught)
        {
            this.splash.play();
            this.plain1_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.plain_Fish;
            this.plain1_Fish_Matrix[0][0] = 0;this.plain1_Fish_Matrix[0][1] = -1;
            this.plain1_Fish_Matrix[1][0] = 1;this.plain1_Fish_Matrix[1][1] = 0;
            this.plain1_Fish_Matrix[2][0] = 1;this.plain1_Fish_Matrix[2][1] = 0;
            this.plain1_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.plain1_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-.5;
            this.plain1_Fish_Matrix = this.plain1_Fish_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.plain1_Fish_Matrix;
        }
        else if(Math.abs((this.plain2_Fish_Matrix[0][3] + 0.25 * Math.cos(this.plain2_angle)) - x) < 1 && Math.abs((this.plain2_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain2_angle)) - y) < 1 && !this.plain2_caught)
        {
            this.splash.play();
            this.plain2_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.plain_Fish;
            this.plain2_Fish_Matrix[0][0] = 0;this.plain2_Fish_Matrix[0][1] = -1;
            this.plain2_Fish_Matrix[1][0] = 1;this.plain2_Fish_Matrix[1][1] = 0;
            this.plain2_Fish_Matrix[2][0] = 1;this.plain2_Fish_Matrix[2][1] = 0;
            this.plain2_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.plain2_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-.5;
            this.plain2_Fish_Matrix = this.plain2_Fish_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.plain2_Fish_Matrix;
        }
        else if(Math.abs((this.small_Fry_Matrix[0][3] + 0.15 * Math.cos(this.fry_angle)) -x) < 1 && Math.abs((this.small_Fry_Matrix[1][3] + 0.15 * Math.sin(this.fry_angle)) - y) < 1 && !this.fry_caught)
        {
            this.splash.play();
            this.fry_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.small_Fry;
            this.small_Fry_Matrix[0][0] = 0;this.small_Fry_Matrix[0][1] = -1;
            this.small_Fry_Matrix[1][0] = 1;this.small_Fry_Matrix[1][1] = 0;
            this.small_Fry_Matrix[2][0] = 1;this.small_Fry_Matrix[2][1] = 0;
            this.small_Fry_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.small_Fry_Matrix[1][3] = this.crosshair_Matrix[1][3]-.5;
            this.small_Fry_Matrix = this.small_Fry_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.small_Fry_Matrix;
        }
        else if(Math.abs((this.small_Fry1_Matrix[0][3] + 0.15 * Math.cos(this.fry1_angle)) -x) < 1 && Math.abs((this.small_Fry1_Matrix[1][3] + 0.15 * Math.sin(this.fry1_angle)) - y) < 1 && !this.fry1_caught)
        {
            this.splash.play(); 
            this.fry1_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.small_Fry;
            this.small_Fry1_Matrix[0][0] = 0;this.small_Fry1_Matrix[0][1] = -1;
            this.small_Fry1_Matrix[1][0] = 1;this.small_Fry1_Matrix[1][1] = 0;
            this.small_Fry1_Matrix[2][0] = 1;this.small_Fry1_Matrix[2][1] = 0;
            this.small_Fry1_Matrix[0][3] = this.crosshair_Matrix[0][3];
            this.small_Fry1_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8;
            this.small_Fry1_Matrix = this.small_Fry1_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.small_Fry1_Matrix;
        }
        else if(Math.abs((this.small_Fry2_Matrix[0][3] + 0.15 * Math.cos(this.fry2_angle)) -x) < 1 && Math.abs((this.small_Fry2_Matrix[1][3] + 0.15 * Math.sin(this.fry2_angle)) - y) < 1 && !this.fry2_caught)
        {
            this.splash.play();
            this.fry2_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.small_Fry;
            this.small_Fry2_Matrix[0][0] = 0;this.small_Fry2_Matrix[0][1] = -1;
            this.small_Fry2_Matrix[1][0] = 1;this.small_Fry2_Matrix[1][1] = 0;
            this.small_Fry2_Matrix[2][0] = 1;this.small_Fry2_Matrix[2][1] = 0;
            this.small_Fry2_Matrix[0][3] = this.crosshair_Matrix[0][3];
            this.small_Fry2_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8;
            this.small_Fry2_Matrix = this.small_Fry2_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.small_Fry2_Matrix;
        }
        else if(Math.abs((this.small_Fry3_Matrix[0][3] + 0.15 * Math.cos(this.fry3_angle)) -x) < 1 && Math.abs((this.small_Fry3_Matrix[1][3] + 0.15 * Math.sin(this.fry3_angle)) - y) < 1 && !this.fry3_caught)
        {
            this.splash.play();
            this.fry3_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.small_Fry;
            this.small_Fry3_Matrix[0][0] = 0;this.small_Fry3_Matrix[0][1] = -1;
            this.small_Fry3_Matrix[1][0] = 1;this.small_Fry3_Matrix[1][1] = 0;
            this.small_Fry3_Matrix[2][0] = 1;this.small_Fry3_Matrix[2][1] = 0;
            this.small_Fry3_Matrix[0][3] = this.crosshair_Matrix[0][3];
            this.small_Fry3_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8;
            this.small_Fry3_Matrix = this.small_Fry3_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.small_Fry3_Matrix;
        }
        else if(Math.abs((this.small_Fry4_Matrix[0][3] + 0.15 * Math.cos(this.fry4_angle)) -x) < 1 && Math.abs((this.small_Fry4_Matrix[1][3] + 0.15 * Math.sin(this.fry4_angle)) - y) < 1 && !this.fry4_caught)
        {
            this.splash.play();
            this.fry4_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.small_Fry;
            this.small_Fry4_Matrix[0][0] = 0;this.small_Fry4_Matrix[0][1] = -1;
            this.small_Fry4_Matrix[1][0] = 1;this.small_Fry4_Matrix[1][1] = 0;
            this.small_Fry4_Matrix[2][0] = 1;this.small_Fry4_Matrix[2][1] = 0;
            this.small_Fry4_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.small_Fry4_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8;
            this.small_Fry4_Matrix = this.small_Fry4_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.small_Fry4_Matrix;
        }
        else if(Math.abs((this.touchy_Fish_Matrix[0][3] + (0.25) * Math.cos(this.touchy_angle)) - x) < 1 && Math.abs((this.touchy_Fish_Matrix[1][3] + Math.sin(this.touchy_angle)) - y) < 1 && !this.touchy_caught)
        {
            this.splash.play();
            this.touchy_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.touchy_Fish;
            this.touchy_Fish_Matrix[0][0] = 0;this.touchy_Fish_Matrix[0][1] = -1;
            this.touchy_Fish_Matrix[1][0] = 1;this.touchy_Fish_Matrix[1][1] = 0;
            this.touchy_Fish_Matrix[2][0] = 1;this.touchy_Fish_Matrix[2][1] = 0;
            this.touchy_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.touchy_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8;
            this.touchy_Fish_Matrix = this.touchy_Fish_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.touchy_Fish_Matrix;
        }
        else if(Math.abs((this.nibbler_Matrix[0][3] + Math.cos(this.nibbler_angle)) - x) < 1 && Math.abs((this.nibbler_Matrix[1][3] + Math.sin(this.nibbler_angle)) - y) < 1 && !this.nibbler_caught)
        {
            this.splash.play();
            this.nibbler_caught = true;
            this.fish_is_caught = true;   
            this.caught_fish_material = this.materials.nibbler;
            this.nibbler_Matrix[0][0] = 0;this.nibbler_Matrix[0][1] = -1;
            this.nibbler_Matrix[1][0] = 1;this.nibbler_Matrix[1][1] = 0;
            this.nibbler_Matrix[2][0] = 1;this.nibbler_Matrix[2][1] = 0;
            this.nibbler_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.nibbler_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8;
            this.nibbler_Matrix = this.nibbler_Matrix.times( Mat4.scale([.5, .5, .5]));
            this.caught_fish_matrix = this.nibbler_Matrix;
        }
        else if(Math.abs((this.friedman_Fish_Matrix[0][3] + Math.cos(this.friedman_angle)) - x) < 2 && Math.abs((this.friedman_Fish_Matrix[1][3] + Math.sin(this.friedman_angle)) - y) < 2 && !this.friedman_caught)
        {
            this.splash.play();
            this.friedman_caught = true;
            this.fish_is_caught = true; 
            this.caught_fish_material = this.materials.friedman_Fish; 
            this.friedman_Fish_Matrix[0][0] = 0;this.friedman_Fish_Matrix[0][1] = -1;
            this.friedman_Fish_Matrix[1][0] = 1;this.friedman_Fish_Matrix[1][1] = 0;
            this.friedman_Fish_Matrix[2][0] = 1;this.friedman_Fish_Matrix[2][1] = 0;
            this.friedman_Fish_Matrix[0][3] = this.crosshair_Matrix[0][3]-.2;
            this.friedman_Fish_Matrix[1][3] = this.crosshair_Matrix[1][3]-.8; 
            
            this.caught_fish_matrix = this.friedman_Fish_Matrix;

        }
     }

    // ***************************** BEGIN ANGLE HELPER FUNCTIONS *****************************
    
    random_king_angle()
     {
        var current_angle = Math.atan2( (this.king_Fish_Matrix[1][3]) , (this.king_Fish_Matrix[0][3]) );
        this.king_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
     }

    random_mystery_angle()
      {
         var current_angle = Math.atan2( (this.mystery_Fish_Matrix[1][3]) , (this.mystery_Fish_Matrix[0][3]) );
         this.mystery_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_plain_angle()
      {
         var current_angle = Math.atan2( (this.plain_Fish_Matrix[1][3]) , (this.plain_Fish_Matrix[0][3]) );
         this.plain_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_plain1_angle()
      {
         var current_angle = Math.atan2( (this.plain1_Fish_Matrix[1][3]) , (this.plain1_Fish_Matrix[0][3]) );
         this.plain1_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_plain2_angle()
      {
         var current_angle = Math.atan2( (this.plain2_Fish_Matrix[1][3]) , (this.plain2_Fish_Matrix[0][3]) );
         this.plain2_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_fry_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry_Matrix[1][3]) , (this.small_Fry_Matrix[0][3]) );
         this.fry_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_fry1_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry1_Matrix[1][3]) , (this.small_Fry1_Matrix[0][3]) );
         this.fry1_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }       

    random_fry2_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry2_Matrix[1][3]) , (this.small_Fry2_Matrix[0][3]) );
         this.fry2_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_fry3_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry3_Matrix[1][3]) , (this.small_Fry3_Matrix[0][3]) );
         this.fry3_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_fry4_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry4_Matrix[1][3]) , (this.small_Fry4_Matrix[0][3]) );
         this.fry4_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_touchy_angle()
      {
         var current_angle = Math.atan2( (this.touchy_Fish_Matrix[1][3]) , (this.touchy_Fish_Matrix[0][3]) );
         this.touchy_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_nibbler_angle()
      {
         var current_angle = Math.atan2( (this.nibbler_Matrix[1][3]) , (this.nibbler_Matrix[0][3]) );
         this.nibbler_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }
      random_friedman_angle()
      {
         var current_angle = Math.atan2( (this.friedman_Fish_Matrix[1][3]) , (this.friedman_Fish_Matrix[0][3]) );
         this.friedman_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }
                     
    // ***************************** END ANGLE HELPER FUNCTIONS ***************************** 

    // ***************************** START OF DISPLAY ***************************** 
     
    display( graphics_state )
      { 
        graphics_state.lights = this.lights;        
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;  
        this.time = t;
        if(this.beginning_animation && !this.ending_animation) {
              this.menu.play();
              if(!this.begin_animation)
                  graphics_state.camera_transform = Mat4.look_at( Vec.of( 0, -5, 1030 ), Vec.of( 0, 100, 0 ), Vec.of( 0, 10, 0 ) );
              this.shapes.plane.draw(graphics_state, this.sign_Matrix, this.materials.start_sign);
              if(this.begin_animation)
              {
                  this.trigger_animation(graphics_state)
                  if(this.menu_volume > 0)
                  {
                        this.menu.volume = this.menu_volume;
                        this.menu_volume = this.menu_volume - 0.01;
                  }
                  if(this.menu_volume <= 0)
                  {
                        this.menu.pause();
                        this.veiled_in_black.play();
                  }     
              }    
        }

        if(!this.beginning_animation && this.ending_animation) {
              graphics_state.camera_transform = Mat4.look_at( Vec.of( 0, -5, 1030 ), Vec.of( 0, 100, 0 ), Vec.of( 0, 10, 0 ) );
              this.shapes.plane.draw(graphics_state, this.sign_Matrix, this.materials.end_sign);
	      if(this.veiled_in_black_volume > 0)
               {
                     this.veiled_in_black.volume = this.veiled_in_black_volume;
                     this.veiled_in_black_volume = this.veiled_in_black_volume - 0.01;
               }
               if(this.veiled_in_black_volume <= 0 && this.fanfare_count == 0)
               {
                     this.veiled_in_black.pause();
                     this.fanfare.play();
                     this.fanfare_count = 1;
               }
        }

        if(!this.beginning_animation && !this.ending_animation) {
              // ***************************** Shadow Map *********************************
              // Helper function to draw the fish - Scene 1
              graphics_state.camera_transform =  Mat4.look_at( Vec.of( 0,5,40,1), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

              this.draw_the_fish(graphics_state, t)
              //transforming camera to light source

              this.scratchpad_context.drawImage( this.webgl_manager.canvas, 0, 0, 256, 256 );
              this.texture.image.src = this.scratchpad.toDataURL("image/png");        // Clear the canvas and start over, beginning scene 2:
//               this.texture.image.src = this.result_img.src = this.scratchpad.toDataURL("image/png");
              this.webgl_manager.gl.clear( this.webgl_manager.gl.COLOR_BUFFER_BIT | this.webgl_manager.gl.DEPTH_BUFFER_BIT);
              //  ******************************* End Shadow Map ****************************

              //transforming camera backwd
              if(!this.zoom_animation)
                  graphics_state.camera_transform = Mat4.look_at( Vec.of( 0, -20, 15 ), Vec.of( 0,0,0 ), Vec.of( 0,10,0 ) );
              else 
                  graphics_state.camera_transform = this.storedCamera;

              // Draw the bottom of the pond
              this.shapes.sphere6.draw( graphics_state, this.bottom_Matrix, this.materials.shadow);

              this.gl.depthMask(false);

              this.draw_the_fish(graphics_state, t)

              this.gl.depthMask(true);
              
              // Draw Crosshairs
              if(!this.catching && !this.fish_is_caught)
              {
                  this.sphere1_Matrix = this.crosshair_Matrix.times(Mat4.scale([.05, .05, 1]));
                  this.sphere2_Matrix = this.crosshair_Matrix.times(Mat4.scale([.05, .05, 1])).times(Mat4.translation([0, 0, 10 + 0.50 * Math.sin((6 * t) % (2 * Math.PI))]));            
                  this.torus1_Matrix = this.crosshair_Matrix.times(Mat4.scale([.07, .07, 1])).times(Mat4.translation([0, 0, 10 + 0.50 * Math.sin((6 * t) % (2 * Math.PI))]));      
                  this.torus2_Matrix = this.crosshair_Matrix.times(Mat4.scale([.08, .08, .1])).times(Mat4.translation([0, 0, 100 + 5 * Math.sin((6 * t) % (2 * Math.PI))]));          
                  this.cylinder_Matrix = this.crosshair_Matrix.times(Mat4.scale([.01, .01, 200])).times(Mat4.translation([0, 0, 0.5]));                                       
              }

              else if(this.catching && !this.fish_is_caught)
              {
                  if(this.sphere1_Matrix[2][3] < 1.5 && this.catching_timer >= 0)
                  {
                        this.sphere1_Matrix[2][3] += 0.3;
                  }
                  else if(this.sphere1_Matrix[2][3] > 0 && this.catching_timer == -1)
                  {
                        this.sphere1_Matrix[2][3] -= 0.1;
                  }

                  if(this.sphere2_Matrix[2][3] < 2.5 && this.catching_timer >= 0)
                  {
                        this.sphere2_Matrix[2][3] += 0.3;
                  }
                  else if(this.sphere2_Matrix[2][3] > 1 && this.catching_timer == -1)
                  {
                        this.sphere2_Matrix[2][3] -= 0.1;
                  }

                  if(this.torus1_Matrix[2][3] < 2.5 && this.catching_timer >= 0)
                  {
                        this.torus1_Matrix[2][3] += 0.3;
                  }
                  else if(this.torus1_Matrix[2][3] > 1 && this.catching_timer == -1)
                  {
                        this.torus1_Matrix[2][3] -= 0.1;
                  }

                  if(this.torus2_Matrix[2][3] < 2.5 && this.catching_timer >= 0)
                  {
                        this.torus2_Matrix[2][3] += 0.3;
                  }
                  else if(this.torus2_Matrix[2][3] > 1 && this.catching_timer == -1)
                  {
                        this.torus2_Matrix[2][3] -= 0.1;
                  }

                  if(this.cylinder_Matrix[2][3] < 11.5 && this.catching_timer >= 0)
                  {
                        this.cylinder_Matrix[2][3] += 0.3;
                  }
                  else if(this.cylinder_Matrix[2][3] > 10 && this.catching_timer == -1)
                  {
                        this.cylinder_Matrix[2][3] -= 0.1;
                  }

                  if(this.catching_timer > 25)
                  {
                      this.catching_timer = -1;
                  }
                  else if(this.catching_timer >= 0)
                  {
                      this.catching_timer++;
                  }
                  if(this.sphere1_Matrix[2][3] <= 0 && this.catching_timer == -1)
                  {
                      this.catching_timer = 0;
                      this.catching = false;
                  }
              }

              //FISHING ROD
              this.shapes.sphere6.draw( graphics_state, this.sphere1_Matrix, this.materials.red);
              this.shapes.sphere6.draw( graphics_state, this.sphere2_Matrix, this.materials.red);
              this.shapes.torus.draw( graphics_state, this.torus1_Matrix, this.materials.white);
              this.shapes.torus.draw( graphics_state, this.torus2_Matrix, this.materials.red);
              this.shapes.cylinder.draw( graphics_state, this.cylinder_Matrix, this.materials.white.override( { color: Color.of( .7, .7, .7, .5) } ));

        }
        this.gl.depthMask(true);  

      if(this.fish_is_caught) {
            this.caught_fish_animation(graphics_state, this.caught_fish_matrix, t);     
      }

        // Draw flattened blue sphere for temporary pond:
        this.shapes.pond.draw( graphics_state, this.pond_Matrix.times(Mat4.scale([1.05,1.05,1.05])), this.materials.pond);

        this.shapes.torus.draw( graphics_state, this.ground_Matrix, this.materials.ground);

        this.draw_the_enviroment(graphics_state, t);
      }
       
      caught_fish_animation(graphics_state, fish_matrix, t) {
            if(this.sphere1_Matrix[2][3] < 2) {
                  fish_matrix[2][3] = fish_matrix[2][3] + .02;
                  fish_matrix = fish_matrix.times(Mat4.rotation(.004, [0, -.1, 0]));
                  this.shapes.plane.draw( graphics_state, fish_matrix, this.caught_fish_material);

                  this.sphere1_Matrix[2][3] = this.sphere1_Matrix[2][3] + .02;
                  this.sphere2_Matrix[2][3] = this.sphere2_Matrix[2][3] + .02;
                  this.torus1_Matrix[2][3] = this.torus1_Matrix[2][3] + .02;
                  this.torus2_Matrix[2][3] = this.torus2_Matrix[2][3] + .02;
                  this.cylinder_Matrix[2][3] = this.cylinder_Matrix[2][3] + .02;
            }
            if(this.sphere1_Matrix[2][3] > 2) {
//                         this.fish_is_caught = false;
//                   this.caught_fish_matrix[0][3] = 100;
//                   this.caught_fish_matrix[1][3] = 100;
                  var fix_rotation = fish_matrix.times(Mat4.rotation(1, [0, -1, 0]));
                  this.shapes.plane.draw( graphics_state, fix_rotation, this.caught_fish_material);
                  this.zoom_animation = true;
                  if(this.start_zoom == -1)  {
                        this.start_zoom = t;

                  }
                  this.caught_fish_camera(graphics_state, fish_matrix, t);
            }

            this.shapes.mText.draw( graphics_state, fish_matrix.times(Mat4.rotation(3 * Math.PI/2, [0, 0, 1])).times(Mat4.translation([2,0,0])), this.materials.text_image );
      }
       caught_fish_camera(graphics_state, fish_matrix, t) {
            if((t - this.start_zoom) <=  3) {
                  var desired = Mat4.identity().times(Mat4.rotation(1.6, [1, 0, 0]));
                  desired[0][3] = fish_matrix[0][3];desired[1][3] = fish_matrix[1][3];desired[2][3] = fish_matrix[2][3];
                   desired = Mat4.inverse(desired.times(Mat4.translation([0, 0, 5])));
                  desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix( x, .1));
                  graphics_state.camera_transform = desired; 
                  this.storedCamera = graphics_state.camera_transform;
            }  else {
                  this.fish_is_caught = false;
                  this.caught_fish_matrix[0][3] = 100;
                  this.caught_fish_matrix[1][3] = 100;
                  this.zoom_animation = false;
                  this.start_zoom = -1;
            }
      }                  

          // *************************************************************************
          // ***************************** DRAW THE ENVIROMETNT **********************
          // *************************************************************************
      draw_the_enviroment(graphics_state, t) {
            
           //  this.shapes.tree.draw( graphics_state, this.tree_Matrix, this.materials.tree);
        this.shapes.tree_stem.draw( graphics_state, this.tree_Matrix2, this.materials.tree_stem);
        this.shapes.tree_leaves.draw( graphics_state, this.tree_Matrix2, this.materials.tree_leaves);                               

           //  this.shapes.tree.draw( graphics_state, this.tree_Matrix, this.materials.tree);
        this.shapes.tree_stem.draw( graphics_state, this.tree_Matrix1, this.materials.tree_stem);
        this.shapes.tree_leaves.draw( graphics_state, this.tree_Matrix1, this.materials.tree_leaves.override( { color: Color.of( .3,.6,.2,1 )}));

        this.shapes.rock.draw( graphics_state, this.rock_Matrix, this.materials.rock);
        this.shapes.plane.draw( graphics_state, this.backdrop_Matrix, this.materials.pond.override( { color: Color.of( 147/255, 224/255, 1, 1), ambient: .8}));

        for(var i = -33; i < -2; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([10 + i/7 + 0.2 * Math.sin(0.5 * t),-3.5,i])).times(Mat4.scale([10,10,10])), this.materials.tree_leaves.override( { color: Color.of( .165,.298,0,1 )}));
        }
        for(var i = -34; i < -2; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([12 + i/5 + 0.2 * Math.sin(t),-3.5,i])).times(Mat4.scale([10,16,10])), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        }
        for(var i = -35; i < -2; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([12 + i/5,-3.5,i])).times(Mat4.scale([10,9,10])), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        }

        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([10,-3.5,13])).times(Mat4.scale([10,10,10])), this.materials.tree_leaves.override( { color: Color.of( .165,.298,0,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([12,-3.5,13])).times(Mat4.scale([10,9,10])), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([13,-3.5,13.5])).times(Mat4.scale([10,9,10])), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([12,-3.5,13])).times(Mat4.scale([10,16,10])), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([11,-5,13])).times(Mat4.scale([10,16,10])), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        
        for(var i = 14; i < 40; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([10 + i/7 + 0.2 * Math.sin(0.5 * t),-3.5,i])).times(Mat4.scale([10,10,10])), this.materials.tree_leaves.override( { color: Color.of( .165,.298,0,1 )}));
        }
        for(var i = 15; i < 40; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([12 + i/5 + 0.2 * Math.sin(t),-3.5,i])).times(Mat4.scale([10,16,10])), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        }
        for(var i = 16; i < 40; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([12 + i/5,-3.5,i])).times(Mat4.scale([10,9,10])), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        }
        
        for(var i = 0; i < 9; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-5 + i,-3.5,-5 + i/5 + 0.2 * Math.sin(t)])).times(Mat4.scale([10,16,10])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        }
        for(var i = -1; i < 8; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-5 + i,-3.5,-5 + i/7 + 0.2 * Math.sin(0.5* t)])).times(Mat4.scale([10,10,10])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .165,.298,0,1 )}));
        }
        for(var i = -2; i < 7; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-5 + i,-3.5,-5 + i/5])).times(Mat4.scale([10,9,10])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        }
        for(var i = 21.5; i < 36; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-5 + i,-3.5,-5 + i/5 + 0.2 * Math.sin(t)])).times(Mat4.scale([10,16,10])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        }
        for(var i = 24; i < 36; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-5 + i,-3.5,-5 + i/7 + 0.2 * Math.sin(0.5* t)])).times(Mat4.scale([10,10,10])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .165,.298,0,1 )}));
        }
        for(var i = 23; i < 36; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-5 + i,-3.5,-5 + i/5])).times(Mat4.scale([10,9,10])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        }

        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([2.5,-3.5, 0])).times(Mat4.scale([10,16,10])).times(Mat4.rotation(Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));

        for(var i = 2; i < 15; i+=3)
        {
              this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([2 - i,-3.5, 0 + i/5])).times(Mat4.scale([10,9,10])).times(Mat4.rotation(Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        }
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([25,-3.5, 0])).times(Mat4.scale([10,16,10])).times(Mat4.rotation(Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([25,-3.5, 0])).times(Mat4.scale([10,9,10])).times(Mat4.rotation(Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));

        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([15,-3.5, 0])).times(Mat4.scale([10,16,10])).times(Mat4.rotation(3 * Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([16,-3.5, 0])).times(Mat4.scale([10,9,10])).times(Mat4.rotation(3 * Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));

        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-7,-3.5, 0])).times(Mat4.scale([10,16,10])).times(Mat4.rotation(3 * Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .33,.60,0,1 )}));
        this.shapes.grass.draw( graphics_state, this.tree_Matrix.times(Mat4.translation([-8,-3.5, 0])).times(Mat4.scale([10,9,10])).times(Mat4.rotation(3 * Math.PI/4, Vec.of(0,1,0))), this.materials.tree_leaves.override( { color: Color.of( .67,.90,.40,1 )}));
        
      }

         // *************************************************************************
         // ***************************** DRAW THE FISH *****************************
         // *************************************************************************

    draw_the_fish(graphics_state, t) 
      {

        // ***************************** BEGIN KING OF THE POND *****************************
        let king_model_transform = Mat4.identity();
        
        if(!this.king_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.king_Fish_Matrix[0][3] + Math.cos(this.king_angle) - 0.3 * Math.sin(this.king_angle)) > 5.5 || Math.abs(this.king_Fish_Matrix[1][3] + 0.3 * Math.cos(this.king_angle) + Math.sin(this.king_angle)) > 5.5) && Math.round( (t % 0.3) * 10) / 10 == 0)
            {
                this.random_king_angle();
            }

            // Code block to draw King fish      
            if(t > this.king_spawn_time && t < this.king_spawn_time + 0.2)
            {
              if(this.king_model_spawn[0][0] < 2)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.king_model_spawn = this.king_model_spawn.times( Mat4.scale([1.4, 1.4, 1.4])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.king_model_spawn, this.materials.king_Fish);
              this.king_Fish_Matrix[0][3] = 0; this.king_Fish_Matrix[1][3] = 0;
            }

            if(t > this.king_spawn_time + 0.2)
            {
                king_model_transform = this.king_Fish_Matrix.times( Mat4.translation([(6 / (t - this.king_dist)) * (0.05) * Math.cos(this.king_angle), (6 / (t - this.king_dist)) * (0.05) * Math.sin(this.king_angle), 0]));

                if( 6 / (t - this.king_dist) < 0.6)
                {
                    this.king_dist += 9;
                }

                if( t - this.king_dist > 10 )
                {
                    this.king_dist += 9;
                }

                this.king_Fish_Matrix = king_model_transform;
                king_model_transform = king_model_transform.times( Mat4.rotation( this.king_angle, Vec.of(0, 0, 1)))
                king_model_transform = king_model_transform.times( Mat4.scale([2, .5, 2]));
                this.shapes.plane.draw( graphics_state, king_model_transform, this.materials.king_Fish);
            }     
        }
        
   
        // ***************************** END KING OF THE POND *****************************  
        
        // ***************************** BEGIN MYSTERY FISH *****************************

            let mystery_model_transform = Mat4.identity();

            if(!this.mystery_caught)
            {
                  // If statement to turn fish if it will translate out of pond
                  if((Math.abs(this.mystery_Fish_Matrix[0][3] + Math.cos(this.mystery_angle)) > 5 || Math.abs(this.mystery_Fish_Matrix[1][3] + Math.sin(this.mystery_angle)) > 5) && Math.round( (t % 0.5) * 10) / 10 == 0)
                  {
                        this.random_mystery_angle();
                  }

                  //if(Math.round( (t % 1.5) * 10) / 10 == .7)
                  //{
                  // this.mystery_angle = (Math.atan2( (this.mystery_Fish_Matrix[1][3]) , (this.mystery_Fish_Matrix[0][3]) )) + (this.mystery_direction * (0.01));
                  //}

                  // Code block to draw Mystery fish 
                  if(t > this.mystery_spawn_time && t < this.mystery_spawn_time + 0.2)
                  {
                        if(this.mystery_model_spawn[0][0] < 2)
                        {
                              if(Math.round( (t % 0.1) * 10) / 10 == 0)
                              {
                                    this.mystery_model_spawn = this.mystery_model_spawn.times( Mat4.scale([1.4, 1.4, 1.4])); 
                              }
                        }
                        this.shapes.plane.draw( graphics_state, this.mystery_model_spawn, this.materials.mystery_Fish);
                        this.mystery_Fish_Matrix[0][3] = 0; this.mystery_Fish_Matrix[1][3] = 0;
                  }

                  if(t > this.mystery_spawn_time + 0.2)
                  {
                        mystery_model_transform = this.mystery_Fish_Matrix.times( Mat4.translation([(5 / (t - this.mystery_dist)) * (0.05) * Math.cos(this.mystery_angle), (5 / (t - this.mystery_dist)) * (0.05) * Math.sin(this.mystery_angle), 0]));

                        if( 6 / (t - this.mystery_dist) < 0.83)
                        {
                              this.mystery_dist += 1;
                        }

                        if( t - this.mystery_dist > 2 )
                        {
                              this.mystery_dist += 1;
                        }
                        this.mystery_Fish_Matrix = mystery_model_transform;
                        mystery_model_transform = mystery_model_transform.times( Mat4.rotation( this.mystery_angle, Vec.of(0, 0, 1)))
                        mystery_model_transform = mystery_model_transform.times( Mat4.scale([2, .5, 2]));
                        this.shapes.plane.draw( graphics_state, mystery_model_transform, this.materials.mystery_Fish);
                  } 
            }

            // ***************************** END MYSTERY FISH ***************************** 

        // ***************************** BEGIN PLAIN FISH *****************************

        let plain_model_transform = Mat4.identity();
        
        if(!this.plain_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.plain_Fish_Matrix[0][3] + 0.25 * Math.cos(this.plain_angle)) > 6 || Math.abs(this.plain_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain_angle)) > 6) && Math.round( (t % 0.5) * 10) / 10 == 0)
            {
                this.random_plain_angle();
            }

            // Code block to draw Plain fish      
            if(t > this.plain_spawn_time && t < this.plain_spawn_time + 0.2)
            {
              if(this.plain_model_spawn[0][0] < .5)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.plain_model_spawn = this.plain_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.plain_model_spawn, this.materials.plain_Fish);
            }

            if(t > this.plain_spawn_time + 0.2)
            {
                plain_model_transform = this.plain_Fish_Matrix.times( Mat4.translation([(0.07) * Math.cos(this.plain_angle), (0.07) * Math.sin(this.plain_angle), 0]));
                this.plain_Fish_Matrix = plain_model_transform;
                plain_model_transform = plain_model_transform.times( Mat4.rotation( this.plain_angle, Vec.of(0, 0, 1)))
                
                this.shapes.plane.draw( graphics_state, plain_model_transform, this.materials.plain_Fish);
            }      
        }
        
        // ***************************** END PLAIN FISH *****************************  
        
        // ***************************** BEGIN PLAIN1 FISH *****************************

        let plain1_model_transform = Mat4.identity();
        
        if(!this.plain1_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.plain1_Fish_Matrix[0][3] + 0.25 * Math.cos(this.plain1_angle)) > 6 || Math.abs(this.plain1_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain1_angle)) > 6) && Math.round( (t % 0.5) * 10) / 10 == 0)
            {
                this.random_plain1_angle();
            }

            // Code block to draw plain1 fish      
            if(t > this.plain1_spawn_time && t < this.plain1_spawn_time + 0.2)
            {
              if(this.plain1_model_spawn[0][0] < .5)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.plain1_model_spawn = this.plain1_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.plain1_model_spawn, this.materials.plain_Fish);
            }

            if(t > this.plain1_spawn_time + 0.2)
            {
                plain1_model_transform = this.plain1_Fish_Matrix.times( Mat4.translation([(0.07) * Math.cos(this.plain1_angle), (0.07) * Math.sin(this.plain1_angle), 0]));
                this.plain1_Fish_Matrix = plain1_model_transform;
                plain1_model_transform = plain1_model_transform.times( Mat4.rotation( this.plain1_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, plain1_model_transform, this.materials.plain_Fish);
            }      
        }        

        // ***************************** END PLAIN1 FISH *****************************  

        // ***************************** BEGIN PLAIN2 FISH *****************************

        let plain2_model_transform = Mat4.identity();

        if(!this.plain2_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.plain2_Fish_Matrix[0][3] + 0.25 * Math.cos(this.plain2_angle)) > 6 || Math.abs(this.plain2_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain2_angle)) > 6) && Math.round( (t % 0.5) * 10) / 10 == 0)
            {
                this.random_plain2_angle();
            }

            // Code block to draw plain2 fish      
            if(t > this.plain2_spawn_time && t < this.plain2_spawn_time + 0.2)
            {
              if(this.plain2_model_spawn[0][0] < .5)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.plain2_model_spawn = this.plain2_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.plain2_model_spawn, this.materials.plain_Fish);
            }

            if(t > this.plain2_spawn_time + 0.2)
            {
                plain2_model_transform = this.plain2_Fish_Matrix.times( Mat4.translation([(0.07) * Math.cos(this.plain2_angle), (0.07) * Math.sin(this.plain2_angle), 0]));
                this.plain2_Fish_Matrix = plain2_model_transform;
                plain2_model_transform = plain2_model_transform.times( Mat4.rotation( this.plain2_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, plain2_model_transform, this.materials.plain_Fish);
            }      
        }
        
        // ***************************** END PLAIN2 FISH *****************************  

        // ***************************** BEGIN SMALL FRY *****************************

        let fry_model_transform = Mat4.identity();

        if(!this.fry_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.small_Fry_Matrix[0][3] + 0.05 * Math.cos(this.fry_angle)) > 5 || Math.abs(this.small_Fry_Matrix[1][3] + 0.05 * Math.sin(this.fry_angle)) > 5) && Math.round( (t % 0.2) * 10) / 10 == 0)
            {
                this.random_fry_angle();
            }

            // Code block to draw Small Fry      
            if(t > this.fry_spawn_time && t < this.fry_spawn_time + 0.2)
            {
              if(this.fry_model_spawn[0][0] < .25)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.fry_model_spawn = this.fry_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.fry_model_spawn, this.materials.small_Fry);
            }

            if(t > this.fry_spawn_time + 0.2)
            {
                fry_model_transform = this.small_Fry_Matrix.times( Mat4.translation([(4 / (t - this.fry_dist)) * (0.05) * Math.cos(this.fry_angle), (4 / (t - this.fry_dist)) * (0.05) * Math.sin(this.fry_angle), 0]));

                if( 4 / (t - this.fry_dist) < 0.8)
                {
                    this.fry_dist += 4;
                }

                if( t - this.fry_dist > 10 )
                {
                    this.fry_dist += 9;
                }
                this.small_Fry_Matrix = fry_model_transform;
                fry_model_transform = fry_model_transform.times( Mat4.rotation( this.fry_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, fry_model_transform, this.materials.small_Fry);
            }      
        }        
        
        // ***************************** END SMALL FRY *****************************

        // ***************************** BEGIN SMALL FRY1 *****************************

        let fry1_model_transform = Mat4.identity();

        if(!this.fry1_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.small_Fry1_Matrix[0][3] + 0.10 * Math.cos(this.fry1_angle)) > 5 || Math.abs(this.small_Fry1_Matrix[1][3] + 0.10 * Math.sin(this.fry1_angle)) > 5) && Math.round( (t % 0.2) * 10) / 10 == 0)
            {
                this.random_fry1_angle();
            }

            // Code block to draw Small Fry      
            if(t > this.fry1_spawn_time && t < this.fry1_spawn_time + 0.2)
            {
              if(this.fry1_model_spawn[0][0] < .25)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.fry1_model_spawn = this.fry1_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.fry1_model_spawn, this.materials.small_Fry);
            }

            if(t > this.fry1_spawn_time + 0.2)
            {
                fry1_model_transform = this.small_Fry1_Matrix.times( Mat4.translation([(4 / (t - this.fry1_dist)) * (0.10) * Math.cos(this.fry1_angle), (4 / (t - this.fry1_dist)) * (0.10) * Math.sin(this.fry1_angle), 0]));

                if( 4 / (t - this.fry1_dist) < 0.8)
                {
                    this.fry1_dist += 2;
                }

                if( t - this.fry1_dist > 10 )
                {
                    this.fry1_dist += 5;
                }
                this.small_Fry1_Matrix = fry1_model_transform;
                fry1_model_transform = fry1_model_transform.times( Mat4.rotation( this.fry1_angle, Vec.of(0, 0, 1))) 
                this.shapes.plane.draw( graphics_state, fry1_model_transform, this.materials.small_Fry);
            }      
        }

        // ***************************** END SMALL FRY1 *****************************  

        // ***************************** BEGIN SMALL FRY2 *****************************

        let fry2_model_transform = Mat4.identity();

        if(!this.fry2_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.small_Fry2_Matrix[0][3] + 0.10 * Math.cos(this.fry2_angle)) > 5 || Math.abs(this.small_Fry2_Matrix[1][3] + 0.10 * Math.sin(this.fry2_angle)) > 5) && Math.round( (t % 0.2) * 10) / 10 == 0)
            {
                this.random_fry2_angle();
            }

            // Code block to draw Small Fry      
            if(t > this.fry2_spawn_time && t < this.fry2_spawn_time + 0.2)
            {
              if(this.fry2_model_spawn[0][0] < .25)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.fry2_model_spawn = this.fry2_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.fry2_model_spawn, this.materials.small_Fry);
            }

            if(t > this.fry2_spawn_time + 0.2)
            {
                fry2_model_transform = this.small_Fry2_Matrix.times( Mat4.translation([0.1 * Math.cos(this.fry2_angle), 0.1 * Math.sin(this.fry2_angle), 0]));
                this.small_Fry2_Matrix = fry2_model_transform;
                fry2_model_transform = fry2_model_transform.times( Mat4.rotation( this.fry2_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, fry2_model_transform, this.materials.small_Fry);
            }      
        }

        // ***************************** END SMALL FRY2 *****************************  

        // ***************************** BEGIN SMALL FRY3 *****************************

        let fry3_model_transform = Mat4.identity();

        if(!this.fry3_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.small_Fry3_Matrix[0][3] + 0.10 * Math.cos(this.fry3_angle)) > 5 || Math.abs(this.small_Fry3_Matrix[1][3] + 0.10 * Math.sin(this.fry3_angle)) > 5) && Math.round( (t % 0.2) * 10) / 10 == 0)
            {
                this.random_fry3_angle();
            }

            // Code block to draw Small Fry      
            if(t > this.fry3_spawn_time && t < this.fry3_spawn_time + 0.2)
            {
              if(this.fry3_model_spawn[0][0] < .25)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.fry3_model_spawn = this.fry3_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.fry3_model_spawn, this.materials.small_Fry);
            }

            if(t > this.fry3_spawn_time + 0.2)
            {
                fry3_model_transform = this.small_Fry3_Matrix.times( Mat4.translation([0.1 * Math.cos(this.fry3_angle), 0.1 * Math.sin(this.fry3_angle), 0]));
                this.small_Fry3_Matrix = fry3_model_transform;
                fry3_model_transform = fry3_model_transform.times( Mat4.rotation( this.fry3_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, fry3_model_transform, this.materials.small_Fry);
            }      
        }       
        
        // ***************************** END SMALL FRY3 *****************************  

        // ***************************** BEGIN SMALL FRY4 *****************************

        let fry4_model_transform = Mat4.identity();

        if(!this.fry4_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.small_Fry4_Matrix[0][3] + 0.15 * Math.cos(this.fry4_angle)) > 5 || Math.abs(this.small_Fry4_Matrix[1][3] + 0.15 * Math.sin(this.fry4_angle)) > 5) && Math.round( (t % 0.2) * 10) / 10 == 0)
            {
                this.random_fry4_angle();
            }

            // Code block to draw Small Fry      
            if(t > this.fry4_spawn_time && t < this.fry4_spawn_time + 0.2)
            {
              if(this.fry4_model_spawn[0][0] < .25)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.fry4_model_spawn = this.fry4_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.fry4_model_spawn, this.materials.small_Fry);
            }

            if(t > this.fry4_spawn_time + 0.2)
            {
                fry4_model_transform = this.small_Fry4_Matrix.times( Mat4.translation([0.2 * Math.cos(this.fry4_angle), 0.2 * Math.sin(this.fry4_angle), 0]));
                this.small_Fry4_Matrix = fry4_model_transform;
                fry4_model_transform = fry4_model_transform.times( Mat4.rotation( this.fry4_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, fry4_model_transform, this.materials.small_Fry);
            }      
        }
        
        // ***************************** END SMALL FRY4 ***************************** 

        // ***************************** BEGIN TOUCHY FISH *****************************

        let touchy_model_transform = Mat4.identity();
        
        if(!this.touchy_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.touchy_Fish_Matrix[0][3] + (0.25) * Math.cos(this.touchy_angle)) > 5 || Math.abs(this.touchy_Fish_Matrix[1][3] + Math.sin(this.touchy_angle)) > 5) && Math.round( (t % 0.5) * 10) / 10 == 0)
            {
                this.random_touchy_angle();
            }

            // Code block to draw Touchy fish      
            if(t > this.touchy_spawn_time && t < this.touchy_spawn_time + 0.2)
            {
              if(this.touchy_model_spawn[0][0] < .5)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.touchy_model_spawn = this.touchy_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.touchy_model_spawn, this.materials.touchy_Fish);
            }

            if(t > this.touchy_spawn_time + 0.2)
            {
                touchy_model_transform = this.touchy_Fish_Matrix.times( Mat4.translation([(8 / (t - this.touchy_dist)) * (0.02) * Math.cos(this.touchy_angle), (8 / (t - this.touchy_dist)) * (0.02) * Math.sin(this.touchy_angle), 0]));

                if( 6 / (t - this.touchy_dist) < 0.5)
                {
                    this.touchy_dist += 4;
                }

                if( t - this.touchy_dist > 5 )
                {
                    this.touchy_dist += 4;
                }
                this.touchy_Fish_Matrix = touchy_model_transform;
                touchy_model_transform = touchy_model_transform.times( Mat4.rotation( this.touchy_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, touchy_model_transform, this.materials.touchy_Fish);
            }     
        }

        // ***************************** END TOUCHY FISH ***************************** 

        // ***************************** BEGIN NIBBLER *****************************

        let nibbler_model_transform = Mat4.identity();
        
        if(!this.nibbler_caught)
        {
            // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.nibbler_Matrix[0][3] + Math.cos(this.nibbler_angle)) > 5 || Math.abs(this.nibbler_Matrix[1][3] + Math.sin(this.nibbler_angle)) > 5) && Math.round( (t % 0.5) * 10) / 10 == 0)
            {
                this.random_nibbler_angle();
                this.nibbler_direction *= -1;
            }

            if(Math.round( (t % 1.5) * 10) / 10 == .7)
            {
                this.nibbler_angle = (Math.atan2( (this.nibbler_Matrix[1][3]) , (this.nibbler_Matrix[0][3]) )) + (this.nibbler_direction * (0.01));
            }

            // Code block to draw Nibbler      
            if(t > this.nibbler_spawn_time && t < this.nibbler_spawn_time + 0.2)
            {
              if(this.nibbler_model_spawn[0][0] < 0.5)
              {
                  if(Math.round( (t % 0.1) * 10) / 10 == 0)
                  {
                      this.nibbler_model_spawn = this.nibbler_model_spawn.times( Mat4.scale([1.4, 1.4, 1.4])); 
                  }
              }
              this.shapes.plane.draw( graphics_state, this.nibbler_model_spawn, this.materials.nibbler);
              this.nibbler_Matrix[0][3] = 0; this.nibbler_Matrix[1][3] = 0;
            }

            if(t > this.nibbler_spawn_time + 0.2)
            {
                nibbler_model_transform = this.nibbler_Matrix.times( Mat4.translation([ (0.15) * Math.cos(this.nibbler_angle), (0.15) * Math.sin(this.nibbler_angle), 0]));
                this.nibbler_Matrix = nibbler_model_transform;
                nibbler_model_transform = nibbler_model_transform.times( Mat4.rotation( this.nibbler_angle, Vec.of(0, 0, 1)))
                this.shapes.plane.draw( graphics_state, nibbler_model_transform, this.materials.nibbler);
            }     
        }

        // ***************************** END NIBBLER FISH *****************************

        if(this.king_caught && this.mystery_caught && this.plain_caught && this.plain1_caught && this.plain2_caught && this.fry_caught && this.fry2_caught && this.fry3_caught && this.fry4_caught && this.touchy_caught && this.nibbler_caught && !this.fish_is_caught)
         {
               if(this.veiled_in_black_volume > 0)
               {
                     this.veiled_in_black.volume = this.veiled_in_black_volume;
                     this.veiled_in_black_volume = this.veiled_in_black_volume - 0.01;
               }
               if(this.veiled_in_black_volume <= 0 && this.fanfare_count == 0)
               {
                     this.veiled_in_black.pause();
                     this.fanfare.play();
                     this.fanfare_count = 1;
               }
               if(this.friedman_Fish_Matrix[0][3] == 20) {
                  this.friedman_Fish_Matrix[0][3] = 0;
                  this.friedman_Fish_Matrix[1][3] = 0;
               }
                          // If statement to turn fish if it will translate out of pond
            if((Math.abs(this.friedman_Fish_Matrix[0][3] + Math.cos(this.friedman_angle)) > 2 || Math.abs(this.friedman_Fish_Matrix[1][3] + Math.sin(this.friedman_angle)) > 2) && Math.round( (t % 0.2) * 10) / 10 == 0)
            {
                this.random_friedman_angle();
                this.friedman_direction *= -1;
            }

            if(Math.round( (t % 1.5) * 10) / 10 == .7)
            {
                this.friedman_angle = (Math.atan2( (this.friedman_Fish_Matrix[1][3]) , (this.friedman_Fish_Matrix[0][3]) )) + (this.friedman_direction * (0.01));
            }
            let friedman_model_transform = Mat4.identity();
            friedman_model_transform = this.friedman_Fish_Matrix.times( Mat4.translation([ (0.10) * Math.cos(this.friedman_angle), (0.10) * Math.sin(this.friedman_angle), 0]));
                this.friedman_Fish_Matrix = friedman_model_transform;
             friedman_model_transform = friedman_model_transform.times( Mat4.rotation( this.friedman_angle, Vec.of(0, 0, 1)))
               this.shapes.plane.draw( graphics_state, friedman_model_transform, this.materials.friedman_Fish);

         }    
      }


  }

class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           
    {
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.di
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec2 mVector = f_tex_coord; 
          mat4 mMatrix = mat4(vec4(1., 0., 0., 0.), vec4(0., 1., 0., 0.), vec4( 0., 0., 1., 0.), vec4( mod(2.0 * animation_time, 88.) , 0., 0., 1.)); 
          vec4 tempVector = vec4(mVector, 0, 0); 
          tempVector = tempVector + vec4(1., 1., 0., 1.); 
          tempVector = mMatrix * tempVector; 

          vec4 tex_color = texture2D( texture, tempVector.xy );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()          
    {
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.

          vec2 mVector = f_tex_coord; 
          mat4 mMatrix = mat4(cos( mod((6.28) * .25 * animation_time, 44. * 3.14)), sin( mod((6.28) * .25 * animation_time, 44. * 3.14)), 0, 0, -sin( mod((6.28) * .25 * animation_time, 44. * 3.14)), cos( mod((6.28) * .25 * animation_time, 44. * 3.14)), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          vec4 tempVector = vec4(mVector, 0, 0); 
          tempVector = tempVector + vec4(-.5, -.5, 0., 0.);
          tempVector = mMatrix * tempVector; 
          tempVector = tempVector + vec4(.5, .5, 0., 0.);
          
          vec4 tex_color = texture2D( texture, tempVector.xy );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}


