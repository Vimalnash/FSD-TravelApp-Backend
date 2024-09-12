import express from "express";
import { serverError } from "../helpers/utils.js";
import { sendMessageEmail, resetPasswordEmail, sendActivationEmail  } from "../controllers/mailer.js";
import { createMessage, 
    addUserPwdResetHash, 
    createNewUser, 
    getUserByActivateHash, 
    userActivation, 
    getUserByEmail, 
    getUserByPwdResetHash, 
    updateNewPwd,
    createRating, 
    deleteUniqueUserPost, 
    getUniqueUserPost, 
    updateUniqueUserPost 
} from "../controllers/user.js";

import bcrypt from "bcrypt";
import { generateToken } from "../helpers/auth.js";
import { isUserAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

// Post User Message
router.post("/usermessage/new", async (req, res) => {
    try {
        const newMessageData = await createMessage(req);
        if (!newMessageData) {
            res.status(400).json({error: "Cannot Create! Try Again or Send Message to vimalnash@gmail.com"});
        }
        const emailres = await sendMessageEmail(newMessageData.fullName, newMessageData.email, newMessageData.message);
        
        if(!emailres) {
            res.status(201).json({message: "Messaging Success", email: "Emailing Failed", data: newMessageData});
        } else {
            res.status(201).json({message: "Messaging Success", email: "Emailing Success", data: newMessageData});
        }
    } catch (error) {
        serverError(error, res);
    }
});



// Create New User account
router.post("/register", async (req, res) => {
    try {
        const isUserExists = await getUserByEmail(req);
        if(isUserExists) {
            return res.status(400).json({error: "User Already Exists"});
        };

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(req.body.password, salt);

        const activateSalt = await bcrypt.genSalt(10);
        const activateHashKey = await bcrypt.hash(req.body.email, activateSalt);

        const userActivateEmail = await sendActivationEmail(req.body.email, activateHashKey);
        if(!userActivateEmail) {
            return res.status(400).json({error: "Mail Sending Failed, Try After Sometime"})
        };

        const createdUser = await createNewUser(req, hashPass, activateHashKey);
        
        return res.status(201).json( { message: "Check Email to Activate and Login", data: createdUser } );
    } catch (error) {
        return serverError(error, res);
    }
});

// User Activation when clicked link from the mail
router.put("/useractivationlink", async (req, res) => {
    try {
        const user = await getUserByActivateHash(req.query.activate);
        if (!user) {
            return res.status(400).json({message: "Already Activated, Try Login"});
        };

        const activatedRes = await userActivation(req.query.activate);
        if (activatedRes.modifiedCount != 1) {
            return res.status(400).json({error: "Not Activated, Try Again"});
        };

        return res.status(200).json({message: "Activation Successfull, Try Login"})

    } catch (error) {
        return serverError(error, res);
    }
});

// User Login Handling
router.post("/login", async (req, res) => {
    try {
        const userData = await getUserByEmail(req);

        if (!userData.isActive) {
            return res.status(400).json({error: "Activate from the link sent to mail or Try Signup"})
        };

        if(!userData) {
            return res.status(400).json({error: "Invalid Credentials"})
        };

        const userValidate = await bcrypt.compare(req.body.password, userData.password);

        if (!userValidate) {
            return res.status(400).json({error: "Invalid Credentials"});
        };

        const token = generateToken(userData._id);

        const { userName, email, isAdmin } = userData;

        return res.status(201).json({message: "LoggedIn Successfully", user: {userName, email, isAdmin}, token: token });
    } catch(error) {
        return serverError(error, res);
    }
});

// User give email to get reset link for forgot password
router.put("/forgotpassword", async (req, res) => {
    try {
        const isUserExists = await getUserByEmail(req);
        if (!isUserExists) {
            return res.status(400).json({error: "Invalid Credential"});
        };

        const salt = await bcrypt.genSalt(10);
        const pwdResetHash = await bcrypt.hash(req.body.email, salt);

        const addPwdResetHashRes = await addUserPwdResetHash(req, pwdResetHash);

        if( !addPwdResetHashRes ) {
            return res.status(400).json({error: "Error Occurred, Please Try after sometime"});
        };

        const isEmailSent = await resetPasswordEmail(isUserExists.email, pwdResetHash);
        if(!isEmailSent) {
            return res.status(400).json({error: "Mail Sending Failed, Try After Sometime"})
        };
        return res.status(200).json({message: "Check Email for ResetLink"})
    } catch (error) {
        return serverError(error, res);
    }
});

// Verify User when click reset link from the mail
router.get("/resetpassword/resetlinkverify", async (req, res) => {
    try {
        const isUserExists = await getUserByPwdResetHash(req.query.reset);
        if (!isUserExists) {
            return res.status(400).json({error: "Password Reset Link Expired"});
        };

        return res.status(200).json({message: "Proceed to NewPassword Page"})

    } catch (error) {
        return serverError(error, res);
    }
});

// User New Password Setting
router.put("/resetpassword/newpassword", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hassPass = await bcrypt.hash(req.body.password, salt);
        const updatedRes = await updateNewPwd(req.query.reset, hassPass);
        if (!updatedRes) {
            return res.status(400).json({error: "Update Failed, Try After Sometime"});
        };
        return res.status(200).json({message: "New Password Updated Successfully"})
    } catch (error) {
        return serverError(error, res);
    }
});



// Post User Rating
router.post("/userrating/new", isUserAuthenticated, async (req, res) => {
    try {
        const newRatingData = await createRating(req);
        if (!newRatingData) {
            return res.status(400).json({error: "Error Posting, Try after sometime" })
        }
        return res.status(201).json({message: "Posted Successfully", data: newRatingData})
    } catch (error) {
        return serverError(error, res);
    }
});

router.get("/userrating/get", isUserAuthenticated, async (req, res) => {
    try {
        const uniqUserPost = await getUniqueUserPost(req)
        if(uniqUserPost.length <= 0) {
            return res.status(400).json({error: "No Data found"});
        }
        return res.status(200).json({message: "Success Getting datas", data: uniqUserPost})
    } catch (error) {
        return serverError(error, res)
    }
});

router.put("/userrating/update/:id", isUserAuthenticated, async (req, res) => {
    try {
        const updatedResponse = await updateUniqueUserPost(req)
        if(updatedResponse.modifiedCount == 0) {
            return res.status(400).json({error: "Error Updating the data"});
        }
        return res.status(200).json({message: "Updated Successfully"})
    } catch (error) {
        return serverError(error, res)
    }
});

router.delete("/userrating/delete/:id", isUserAuthenticated, async (req, res) => {
    try {
        const deletedData = await deleteUniqueUserPost(req)
        if(!deletedData) {
            return res.status(400).json({error: "Cannot Delete Try again!"});
        }
        return res.status(200).json({message: "Deleted Successfully", data: deletedData})
    } catch (error) {
        return serverError(error, res)
    }
})

export const userRouter = router;