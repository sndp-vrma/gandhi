'use strict';

angular.module('gandhi-component-review', ['gandhi-component', 'schemaForm'])

.config(function(GandhiComponentProvider) {
	GandhiComponentProvider.components['review'] = {
		title: "Form",
		directives: {
			default: 'gandhi-component-review',
			summary: 'gandhi-component-review-summary',
			admin: 'gandhi-component-review-admin'
		}
	};
})

.directive('gandhiComponentReview', function() {
	return {
		scope: false,
		templateUrl: 'assets/bower/gandhi-component-review/app/default.html',
		controller: function($scope, $element, $attrs, $rootScope, Restangular, $state) {
			$scope.$watch('context', function(context) {

				if(!context.cycle || !context.project)
					return;

				$scope.context = context;

				$scope.stage = context.cycle.flow[context.stage];
				$scope.options = context.cycle.flow[context.stage].component.options;
				$scope.permissions = context.project.flow[context.stage].permissions;
				$scope.data = context.project.flow[context.stage].data


				$scope.tab = $scope.permissions.write ? 'write' : 'read';

				// for the write tab
				$scope.write = {};
				$scope.write.preview = $scope.options.preview[0];
				$scope.write.review = $scope.data[$rootScope.currentUser.id] ? $scope.data[$rootScope.currentUser.id] : {data: {}, status: 'none'};
				$scope.write.save = function(){
					if(!$scope.permissions.write)
						return alert('Sorry, but you do not have write permissions.');

					var project = {flow:{}};
					project.flow[context.stage] = {id: context.stage, data: {}};
					project.flow[context.stage].data[$rootScope.currentUser.id] = $scope.write.review;

					context.project.patch(project).then(function(res){

						// update the project
						$rootScope.$broadcast('projects');

						alert('Changes successfully saved!');
					}, function(err){
						alert('Sorry, but there was an error saving your changes. Pleast contact us.');
					});
				}

				$scope.write.submit = function(form, model){
					if(!$scope.permissions.write)
						return alert('Sorry, but you do not have write permissions.');

					// validate
					$scope.$broadcast('schemaFormValidate');
					if (!form.$valid)
					  return alert('Sorry, but there are errors the form. Please correct them before submitting.');

					// confirm submission
					if($scope.options.confirm && !confirm($scope.options.confirm))
						return;

					var project = {flow:{}};
					project.flow[context.stage] = {id: context.stage, data: {}};
					project.flow[context.stage].data[$rootScope.currentUser.id] = $scope.write.review;
					project.flow[context.stage].data[$rootScope.currentUser.id].status = 'submitted';

					context.project.patch(project).then(function(res){

						// update the project lists
						$rootScope.$broadcast('projects');

						// update the project itself
						angular.extend(context.project, res);

						alert('Successfully saved!');
					}, function(err){
						alert('Sorry, but there was an error submitting this application. Pleast contact us.');
					});
				}


				// for the read tab
				$scope.read = {};
				$scope.read.config = { formDefaults: { readonly: true } };
				$scope.read.groups = [];
				_.each($scope.options.form, function(group){
					var schema = $scope.options.schema.properties[group.key];
					var o = {
						key: group.key,
						title: group.title || schema.title,
						form: [_.extend({}, group.items[0], {readonly: true})],
						data: []
					};

					_.each($scope.data, function(review, id){
						if(review.data && review.data[group.key] && (review.data[group.key].public || $scope.permissions['read:private']))
							o.data.push({
								id: id,
								data: review.data
							});
					});

					if(o.data.length > 0)
						$scope.read.groups.push(o);
				});

				// if($scope.permissions['read:users']){
					// $scope.read.ids = _.unique($scope.read.ids);
					// Restangular.all('users').getList({filter: {id: {in: JSON.stringify($scope.read.ids)}}}).then(function(res){
					// 	$scope.read.users = _.indexBy(res.data, 'id');
					// 	console.log($scope.read.ids, $scope.permissions)
					// });
				// }

				$scope.read.group = $scope.read.groups[0];

			});
		}
	}
})

.directive('gandhiComponentReviewSummary', function() {
	return {
		scope: false,
		templateUrl: 'assets/bower/gandhi-component-review/app/summary.html',
		controller: function($scope, $element, $attrs, $rootScope, Restangular, $state) {
			$scope.$watch('context', function(context) {

				if(!context.cycle || !context.project)
					return;

				$scope.context = context;

				$scope.stage = context.cycle.flow[context.stage];
				$scope.options = context.cycle.flow[context.stage].component.options;
				$scope.permissions = context.project.flow[context.stage].permissions;
				$scope.data = context.project.flow[context.stage].data

				// for the read tab
				$scope.read = {};
				$scope.read.config = { formDefaults: { readonly: true } };
				$scope.read.groups = [];
				_.each($scope.options.form, function(group){
					var schema = $scope.options.schema.properties[group.key];
					var o = {
						key: group.key,
						title: group.title || schema.title,
						form: [_.extend({}, group.items[0], {readonly: true})],
						data: []
					};

					_.each($scope.data, function(review, id){
						if(review.data && review.data[group.key] && (review.data[group.key].public || $scope.permissions['read:private']))
							o.data.push({
								id: id,
								data: review.data
							});
					});

					if(o.data.length > 0)
						$scope.read.groups.push(o);
				});

				$scope.read.group = $scope.read.groups[0];

			});
		}
	}
})

.directive('gandhiComponentReviewAdmin', function() {
	return {
		scope: false,
		templateUrl: 'assets/bower/gandhi-component-review/app/admin.html',
		controller: function($scope, $element, $attrs, $rootScope, Restangular, $state) {

		}
	}
});
