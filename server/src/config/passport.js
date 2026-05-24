import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import User from "../models/User.js";
import Invite from "../models/Invite.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    userProfileURL: process.env.GOOGLE_USER_PROFILE_URL
}, async (accessToken, generateRefreshToken, profile, done) => {
    const{id: google_id, emails, name: names} = profile;
    const email = emails[0].value;
    const name = names.givenName;

    try{
        const user = await User.findOne({email: email});
        if(user){
            console.log("Successful Google Oauth, Already Existing in Database");
            console.log("user:", user);
            done(null, user);
        }else{
            const invite = await Invite.findOne({ email });
            const user = await User.create({
                email: email,
                name: name,
                role: invite ? invite.role : 'hr',
                organizationId: invite ? invite.organizationId : null,
                status: "active",
            })
            console.log("Successful Google Oauth, Inserted into Database");
            console.log("user:", user);
            done(null, user);
        }
    }catch(error){
        console.log(error);
        done(error);
    }
}))

export default passport;