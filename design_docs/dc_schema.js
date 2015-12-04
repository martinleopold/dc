/**
 * Dinner Collective
 * Data Model
 * Format: JSON Schema
 */

/* eslint no-unused-vars:0 */
var dcSchema =
{
   "$schema": "http://json-schema.org/schema#",

   /**
    * GENERAL
    */

   // a geolocation
   "locationSchema" : {
      "type" : "object",
      "properties" : {
         "latitude"   : { "type" : "number" },
         "longitude"   : { "type" : "number" }
      }
   },

   // a physical address
   "addressSchema" : {
      "type" : "object",
      "properties" : {
         "street"            : { "type" : "string" },
         "no"                : { "type" : "string" },
         "zip"               : { "type" : "integer" },
         "city"              : { "type" : "string" },
         "location"          : { "$ref" : "#/locationSchema"},
         "displayLocation"   : { "$ref" : "#/locationSchema"}
      }
   },

   // a string ID
   "idSchema" : {
      "type" : "string"
   },

   // a single reference (using string ID)
   "refSchema" : {
      "type" : "string"
   },

   // a list of references (using string IDs)
   "refListSchema" : {
      "type" : "object",
      "properties" : {
         "patternProperties": { "^S_$": { "type": "boolean" } }
      }
   },

   // a timestamp
   "timestampSchema" : {
      "type" : "string"
   },



   /**
    * USER
    */

   "userSchema" : {
      "type" : "object",
      "properties" : {
         "userId"         : { "$ref" : "#/idSchema" },
         "createdAt"      : { "$ref" : "#/timestampSchema" },
         "updatedAt"      : { "$ref" : "#/timestampSchema" },
         "firstName"      : { "type" : "string" },
         "lastName"       : { "type" : "string" },
         "address"        : { "$ref" : "#/addressSchema" },
         "email"          : { "type" : "email" },
         "info"           : { "type" : "string" },
         "settings"       : { "$ref" : "#/userSettingsSchema" },
         "image"         : { "$ref" : "#/userImageSchema" },
         "friends"        : { "$ref" : "#/refListSchema" },
         "credits"        : { "type" : "integer" }
      }
   },

   "userImageSchema" : {
      "type" : "object",
      "properties" : {
         "url"   : { "type" : "string" }
      }
   },

   "userSettingsSchema" : {
      "type" : "object",
      "properties" : {
         "defaultRadius" : { "type" : "integer" }
      }
   },


   /**
    * FRIEND REQUESTS
    */

    "friendRequestSchema" : {
      "type" : "object",
      "properties" : {
         "friendRequestId"    : { "$ref" : "#/idSchema" },
          "createdAt"         : { "$ref" : "#/timestampSchema" },
          "updatedAt"         : { "$ref" : "#/timestampSchema" },
          "byUser"            : { "$ref" : "#/idSchema" },
          "toUser"            : { "$ref" : "#/idSchema" },
          "status"            : { "enum" : [ "pending", "accepted", "rejected" ] }
      }
    },


   /**
    * DINNER
    */

   "dinnerSchema" : {
      "type" : "object",
      "properties" : {
         "dinnerId"          : { "$ref" : "#/idSchema" },
         "createdAt"         : { "$ref" : "#/timestampSchema" },
         "updatedAt"         : { "$ref" : "#/timestampSchema" }, // when closed or cancelled
         "hostedByUser"      : { "$ref" : "#/refSchema" },
         "title"             : { "type" : "string" },
         "description"       : { "type" : "string" },
         "tags"              : { "$ref" : "#/dinnerTagsSchema" },
         "addressOverride"   : { "$ref" : "#/addressSchema" },
         "dineinAt"          : { "$ref" : "#/timestampSchema" },
         "takeawayFrom"      : { "$ref" : "#/timestampSchema" },
         "takeawayUntil"     : { "$ref" : "#/timestampSchema" },
         "isPublic"          : { "type" : "boolean" },
         "closedAt"          : { "$ref" : "#/timestampSchema" },
         "cancelledAt"       : { "$ref" : "#/timestampSchema" }
      }
   },

   "dinnerTagsSchema" : {
      "type" : "object",
      "patternProperties": { "^S_$": { "type": "boolean" } }
   },



   /**
    * APPLICATION
    *
    * An application by a user to join a dinner.
    */

   "applicationSchema" : {
      "type" : "object",
      "properties" : {
         "applicationId"   : { "$ref" : "#/idSchema" },
         "createdAt"       : { "$ref" : "#/timestampSchema" },
         "updatedAt"       : { "$ref" : "#/timestampSchema" }, // when status changes
         "byUser"          : { "$ref" : "#/refSchema" },
         "forDinner"       : { "$ref" : "#/refSchema" },
         "host"            : { "$ref" : "#/refSchema" },
         "state"          : { "enum" : [ "PENDING", "ACCEPTED", "REJECTED", "etc." ] },
         "credits"         : { "type" : "integer" },
         "details"         : { "$ref" : "#/applicationDetailsSchema" },
         "changes"         : { "$ref" : "#/applicationDetailsSchema" }
      }
   },

   "applicationDetailsSchema" : {
      "type" : "object",
      "properties" : {
         "spotsDinein"      : { "type" : "integer" },
         "spotsTakeaway"    : { "type" : "integer" },
         "spotsTotal"       : { "type" : "integer" },
         "notifyUntil"   : { "$ref" : "#/timestampSchema" }
      }
   },



   // /**
   //  * INVITATION
   //  *
   //  * An invitation for a user to join a dinner or group.
   //  * Can't add this to the user, since a way is needed to list invited users for a dinner.
   //  * If a group is invited to a dinner, invitations are sent to all current members.
   //  */
   //
   // "invitationSchema" : {
   //    "type" : "object",
   //    "properties" : {
   //       "invitationId"   : { "$ref" : "#/idSchema" },
   //       "createdAt"      : { "$ref" : "#/timestampSchema" },
   //       "updatedAt"      : { "$ref" : "#/timestampSchema" }, // when status changes
   //       "forUser"      : { "$ref" : "#/refSchema" },
   //       "byUser"         : { "$ref" : "#/refSchema" },
   //       "type"         : { "enum" : [ "dinner", "group" ] },
   //       "toDinner"      : { "$ref" : "#/refSchema" },
   //       "toGroup"      : { "$ref" : "#/refSchema" },
   //       "status"       : { "enum" : [ "pending", "accepted", "rejected" ] }
   //    }
   // },

   // /**
   //  * INVITATION
   //  *
   //  * An invitation for a user to join a dinner.
   //  */
   // "invitationToDinnerSchema" : {
   //    "allOf" : [
   //       { "$ref": "#/invitationSchema" },
   //       { "type" : "object",
   //          "properties" : {
   //             "dinner"   : { "$ref" : "#/refSchema" }
   //          }
   //       }
   //    ]
   // },

   // /**
   //  * INVITATION
   //  *
   //  * An invitation for a user to join a group.
   //  */
   // "invitationToGroupSchema" : {
   //    "allOf" : [
   //       { "$ref": "#/invitationSchema" },
   //       { "type" : "object",
   //          "properties" : {
   //             "group"      : { "$ref" : "#/refSchema" }
   //          }
   //       }
   //    ]
   // },



   /**
    * MESSAGE
    *
    * A message posted to a dinner or group, possibly in reply to another message.
    * Either dinner or group needs to be != "".
    */

   "messageSchema" : {
      "type" : "object",
      "properties" : {
         "messageId"        : { "$ref" : "#/idSchema" },
         "createdAt"        : { "$ref" : "#/timestampSchema" },
         "byUser"           : { "$ref" : "#/refSchema" },
         "text"             : { "type" : "string" },
         "inReplyToMessage" : { "$ref" : "#/refSchema" }, // "" if n/a
         "toDinner"         : { "$ref" : "#/refSchema" },
         "toGroup"          : { "$ref" : "#/refSchema" }
      }
   },



   /**
    * GROUP
    */

   "groupSchema" : {
      "type" : "object",
      "properties" : {
         "groupId"        : { "$ref" : "#/idSchema" },
         "createdAt"      : { "$ref" : "#/timestampSchema" },
         "title"          : { "type" : "string" },
         "description"    : { "type" : "string" },
         "isInviteOnly"   : { "type" : "boolean" }
      }
   },

   "groupMembershipSchema" : {
      "type" : "object",
      "properties" : {
         "groupMembershipId" : { "$ref" : "#/idSchema" },
         "createdAt"         : { "$ref" : "#/timestampSchema" },
         "updatedAt"         : { "$ref" : "#/timestampSchema" },
         "byUser"            : { "type" : "string" },
         "forGroup"          : { "type" : "string" },
         "isAdmin"           : { "type" : "boolean" }
      }
   },



   /**
    * NOTIFICATION
    */

   "notificationSchema" : {
      "type" : "object",
      "properties" : {
         "notificationId"   : { "$ref" : "#/idSchema" },
         "createdAt"        : { "$ref" : "#/timestampSchema" },
         "openedAt"         : { "$ref" : "#/timestampSchema" },
         "forUser"          : { "$ref" : "#/refSchema" },
         "type"             : { "type" : "string" },
         "text"             : { "type" : "string" }
      }
   },



   /**
    * REVIEW
    */

   "reviewSchema" : {
      "type" : "object",
      "properties" : {
         "reviewId"      : { "$ref" : "#/idSchema" },
         "createdAt"     : { "$ref" : "#/timestampSchema" },
         "byUser"        : { "$ref" : "#/refSchema" },
         "aboutDinner"   : { "$ref" : "#/refSchema" },
         "aboutUser"     : { "$ref" : "#/refSchema" },
         "text"          : { "type" : "string" }
      }
   }

};
