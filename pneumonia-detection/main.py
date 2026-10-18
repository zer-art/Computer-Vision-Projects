import numpy as np 
import tensorflow as tf 

preprocessor = tf.keras.models.load_model('models/preprocessor.h5')
classifier = tf.keras.models.load_model('models/my_pneumonia_classifier_sequential_model.h5')

img = tf.keras.utils.load_img('input/person1_virus_6.jpeg') 
img_array = tf.keras.utils.img_to_array(img) 

raw_img_batch = np.expand_dims(img_array, axis=0)
processed_batch = preprocessor(raw_img_batch)

predictions = classifier.predict(processed_batch)
predicted_class_index = np.argmax(predictions[0])

if(predicted_class_index == 1 ):
    print("pneumonia founded ")
else : 
    print ("Normal")

