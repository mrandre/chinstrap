module.exports = (grunt) ->
	grunt.initConfig(
		pkg: grunt.file.readJSON("package.json")
		
		coffee:
			options:
				bare: true
			chinstrap:
				cwd: "src"
				src: ["**/*.coffee"]
				dest: "app"
				expand: true
				ext: ".js"

		watch:
			coffee:
				files: ['src/**/*.coffee']
				tasks: ['coffee']
	)	
	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-coffee')
	grunt.registerTask('default', ['coffee:chinstrap'])
