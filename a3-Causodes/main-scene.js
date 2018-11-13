window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,5 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either dos this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        const shapes = { box:   new Cube(),
                         box_2: new Cube2(),
                         axis:  new Axis_Arrows(),
                         ec: new Complex_Shape()
                       }
        this.submit_shapes( context, shapes );

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials =
          { phong:      context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            kevin:      context.get_instance( Texture_Rotate ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/justice.jpeg", false ) } ),
            riven:      context.get_instance( Texture_Scroll_X ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/boxbox.png", true ) } ),
            swirl:      context.get_instance( Texture_Scroll_X ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/swirl.png", false ) } ),
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

        // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.

        this.isRotating = false; 
        this.lastt = 0; 

        this.box1Matrix = Mat4.identity(); 
        this.box1Matrix = this.box1Matrix.times( Mat4.translation([-2, 0, 0])); 

        this.box2Matrix = Mat4.identity(); 
        this.box2Matrix = this.box2Matrix.times( Mat4.translation([2, 0, 0])); 

        this.box3Matrix = Mat4.identity(); 
        this.box3Matrix = this.box3Matrix.times( Mat4.translation([0, -2, 0])); 

        }
        start_stop() 
        { 
        
        this.isRotating = !this.isRotating; 

      }
    make_control_panel()
      { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button( "Start/Stop Rotation", [ "c" ], this.start_stop );
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // TODO:  Draw the required boxes. Also update their stored matrices.
        //this.shapes.box.draw( graphics_state, Mat4.identity(), this.materials.riven );
        if (this.isRotating) { 
            this.box1Matrix = this.box1Matrix.times( Mat4.rotation(Math.PI * dt, [1, 0, 0]) ) 
        }

        this.shapes.box.draw( graphics_state, this.box1Matrix, this.materials.kevin ); 

        if (this.isRotating) { 
            this.box2Matrix = this.box2Matrix.times( Mat4.rotation(.66 * Math.PI * dt, [0, 1, 0]) ) 
        } 

        this.shapes.box_2.draw( graphics_state, this.box2Matrix, this.materials.riven );
        this.shapes.ec.draw( graphics_state, this.box3Matrix, this.materials.swirl );
      }
  }

class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
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
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
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
